from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import PyPDF2
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="GoGarvis API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# LLM Integration
from emergentintegrations.llm.chat import LlmChat, UserMessage

# Store chat instances per session
chat_sessions = {}

# Path to GoGarvis documentation
DOCS_PATH = Path("/app/gogarvis_docs")

# ============== Models ==============

class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class Document(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    filename: str
    title: str
    category: str
    description: str
    content: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GlossaryTerm(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    term: str
    definition: str
    category: str

class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str

class SystemComponent(BaseModel):
    id: str
    name: str
    description: str
    status: str
    layer: int
    key_functions: List[str]

# ============== Canonical Glossary ==============

GLOSSARY_DATA = [
    # Core Systems
    {"term": "GARVIS", "definition": "Sovereign intelligence and enforcement layer governing reasoning, routing, and execution safety across all Pearl & Pig systems. GARVIS enforces truth but does not approve decisions.", "category": "Core Systems"},
    {"term": "Pearl & Pig", "definition": "Systems-first creative IP studio and sole owner of the GARVIS architecture and its constituent systems.", "category": "Core Systems"},
    {"term": "ECOS", "definition": "Enterprise Creative Operating System - A tenant-safe, white-label deployment pattern powered by GARVIS. Enterprises own their knowledge bases and outputs; Pearl & Pig retains system ownership.", "category": "Core Systems"},
    {"term": "Telauthorium", "definition": "Authoritative authorship, provenance, and rights registry. Nothing is real, licensable, or defensible unless registered in Telauthorium.", "category": "Core Systems"},
    {"term": "Flightpath COS", "definition": "Creative and operational law governing phase discipline, proof gates, and completion logic from SPARK through SUNSET.", "category": "Core Systems"},
    {"term": "MOSE", "definition": "Multi-Operator Systems Engine - Orchestration engine that routes work through Pig Pen operators under GARVIS enforcement and Flightpath constraints.", "category": "Core Systems"},
    {"term": "TELA", "definition": "Trusted Efficiency Liaison Assistant - Execution layer that converts authorized intent into real-world action through constrained adapters.", "category": "Core Systems"},
    {"term": "Pig Pen", "definition": "Frozen registry of non-human cognition operators (TAI-D) used for analysis, flags, and recommendations. Pig Pen operators never approve decisions.", "category": "Core Systems"},
    {"term": "UOL", "definition": "User Overlay Layer - Permissioned, advisory customization layer allowing user perspectives, goals, and role-based visibility without altering system authority.", "category": "Core Systems"},
    # Identity & Authority
    {"term": "TID", "definition": "Telauthorium ID - Immutable identity assigned to every object (idea, decision, artifact, output, deal, report, execution event).", "category": "Identity"},
    {"term": "TAID", "definition": "Telauthorium Authority ID - Immutable identifier representing a real human authority. All accountability resolves to a TAID.", "category": "Identity"},
    {"term": "TAI-D", "definition": "Telauthorium AI-D - Identifier assigned to a non-human Pig Pen operator. TAI-Ds have cognition authority only.", "category": "Identity"},
    {"term": "TSID", "definition": "Telauthorium Sovereign ID - Non-delegable sovereign authority identifier held by the Founder/Architect.", "category": "Identity"},
    {"term": "UOID", "definition": "User Overlay ID - Identifier for a specific user overlay pack applied at runtime.", "category": "Identity"},
    # Operational Terms
    {"term": "Routing Plan", "definition": "Ordered sequence of Pig Pen operator consults produced by MOSE prior to execution.", "category": "Operations"},
    {"term": "Execution Event", "definition": "Ledger-recorded action performed by TELA.", "category": "Operations"},
    {"term": "Decision Event", "definition": "Ledger-recorded resolution made by a human TAID.", "category": "Operations"},
    {"term": "Enforcement Event", "definition": "Ledger-recorded block, halt, or constraint trigger.", "category": "Operations"},
    {"term": "HALT", "definition": "System state indicating execution is illegal or unsafe to proceed.", "category": "Operations"},
    {"term": "PAUSE", "definition": "System state indicating execution is legal but requires human judgment before proceeding.", "category": "Operations"},
    # Commercial Terms
    {"term": "License Bundle", "definition": "A scoped, time-bound grant of access to GARVIS-powered capabilities. Ownership is never transferred.", "category": "Commercial"},
    {"term": "Component License", "definition": "License granting access to a specific system component (e.g., Telauthorium) under defined constraints.", "category": "Commercial"},
    {"term": "OEM Deployment", "definition": "Sandboxed, white-label deployment governed by Pearl & Pig with strict architectural isolation.", "category": "Commercial"},
    {"term": "Canon Lock", "definition": "Document version control requiring founder authorization for any changes, with version numbering and published delta logs.", "category": "Commercial"},
    # Phases
    {"term": "SPARK", "definition": "Initial ideation phase in the Flightpath COS lifecycle.", "category": "Phases"},
    {"term": "BUILD", "definition": "Development and construction phase in the Flightpath COS lifecycle.", "category": "Phases"},
    {"term": "LAUNCH", "definition": "Release and deployment phase in the Flightpath COS lifecycle.", "category": "Phases"},
    {"term": "EXPAND", "definition": "Growth and scaling phase in the Flightpath COS lifecycle.", "category": "Phases"},
    {"term": "EVERGREEN", "definition": "Ongoing maintenance and evolution phase in the Flightpath COS lifecycle.", "category": "Phases"},
    {"term": "SUNSET", "definition": "End-of-life and deprecation phase in the Flightpath COS lifecycle.", "category": "Phases"},
]

# ============== Architecture Components ==============

SYSTEM_COMPONENTS = [
    {
        "id": "sovereign",
        "name": "SOVEREIGN AUTHORITY",
        "description": "TSID-0001 Founder / Architect - Constitutional authority, final arbitration, versioning & canon control",
        "status": "active",
        "layer": 0,
        "key_functions": ["Constitutional authority", "Final arbitration", "Versioning & canon control"]
    },
    {
        "id": "telauthorium",
        "name": "TELAUTHORIUM",
        "description": "Authorship, Provenance, Rights Registry - TID/TAID/TAI-D enforcement, rights clarity & licensing state",
        "status": "active",
        "layer": 1,
        "key_functions": ["Authorship", "Provenance", "Rights Registry", "TID/TAID/TAI-D enforcement"]
    },
    {
        "id": "garvis",
        "name": "GARVIS",
        "description": "Sovereign Intelligence & Enforcement - Truth enforcement, drift & risk detection",
        "status": "active",
        "layer": 2,
        "key_functions": ["Truth enforcement", "Drift detection", "Risk detection", "Halts/pauses authority"]
    },
    {
        "id": "flightpath",
        "name": "FLIGHTPATH COS",
        "description": "Creative Law & Phase Discipline - SPARK → BUILD → LAUNCH → EXPAND → EVERGREEN → SUNSET",
        "status": "active",
        "layer": 3,
        "key_functions": ["Phase discipline", "Proof gates", "Phase blocks", "Routes cognition"]
    },
    {
        "id": "mose",
        "name": "MOSE",
        "description": "Multi-Operator Systems Engine - Operator routing & sequencing, escalation & conflict resolution",
        "status": "active",
        "layer": 4,
        "key_functions": ["Operator routing", "Sequencing", "Escalation", "Conflict resolution", "UOL application"]
    },
    {
        "id": "pigpen",
        "name": "PIG PEN",
        "description": "Non-Human Cognition Operators (TAI-D) - Analysis, flags, recommendations (no approval authority)",
        "status": "active",
        "layer": 5,
        "key_functions": ["Analysis", "Flags", "Recommendations", "Frozen registry"]
    },
    {
        "id": "tela",
        "name": "TELA",
        "description": "Trusted Efficiency Liaison Assistant - Executes approved actions through adapter-based tooling",
        "status": "active",
        "layer": 6,
        "key_functions": ["Executes approved actions", "Adapter-based tooling", "No scope expansion"]
    },
    {
        "id": "audit",
        "name": "AUDIT & EVENT LEDGER",
        "description": "Immutable, Append-Only Truth Record - Records decisions, routing, enforcement, execution",
        "status": "active",
        "layer": 7,
        "key_functions": ["Immutable records", "Decision logging", "Routing logs", "Enforcement logs", "Execution logs"]
    }
]

# ============== Document Metadata ==============

DOCUMENT_METADATA = [
    {"filename": "69ad3608-fba2-48f0-98a5-60166202e9a1_7.1_garvis_full_stack__one-page_architecture_diagram.pdf", "title": "GARVIS Full Stack Architecture Diagram", "category": "Architecture", "description": "One-page architectural reference showing authority flow across all system components."},
    {"filename": "c4205f70-436c-47f4-85e1-a7a6e76ece8f_0.2_canonical_glossary__garvis_full_stack.pdf", "title": "Canonical Glossary", "category": "Reference", "description": "Official terminology and definitions for the GARVIS Full Stack system."},
    {"filename": "1dc7cd15-1039-4f63-a76a-cf60ffec7cc7_0.1_pearl__pig__canonical_dictionary__language_authority.pdf", "title": "Pearl & Pig Canonical Dictionary", "category": "Reference", "description": "Language authority and canonical dictionary for the Pearl & Pig ecosystem."},
    {"filename": "ee7437e6-b48a-40f8-a0d0-11752acb44fc_2.1_garvis__executive_creative__systems_brief.pdf", "title": "GARVIS Executive Systems Brief", "category": "GARVIS", "description": "Executive overview of the GARVIS sovereign intelligence system."},
    {"filename": "e23081a9-13a5-41c3-858f-2c55b64e6c6c_2.2_garvis__telauthorium__enforcement_contract__engineering_specification.pdf", "title": "GARVIS Telauthorium Enforcement Contract", "category": "GARVIS", "description": "Engineering specification for enforcement contracts between GARVIS and Telauthorium."},
    {"filename": "db8a2ffb-7435-4430-99d6-cc08b46eae6c_Telauthorium__Executive_Creative__Systems_Brief.pdf", "title": "Telauthorium Executive Systems Brief", "category": "Telauthorium", "description": "Executive overview of the Telauthorium rights and provenance registry."},
    {"filename": "ec618a24-4ab4-4290-b91d-37d78dd49ce1_1.2_telauthorium_id_registry__master_list.pdf", "title": "Telauthorium ID Registry Master List", "category": "Telauthorium", "description": "Master list of all Telauthorium identifiers and registrations."},
    {"filename": "4493d418-50d1-4ded-865d-f89f1c4633db_1.3_unified_identity__object_model__canonical_specification.pdf", "title": "Unified Identity Object Model", "category": "Identity", "description": "Canonical specification for the unified identity object model."},
    {"filename": "9c06e3db-b6b8-4cbc-93f3-e9bb0af84fc2_Flightpath_COS__Executive_Creative__Systems_Brief.pdf", "title": "Flightpath COS Executive Brief", "category": "Flightpath", "description": "Executive overview of the Flightpath Creative Operating System."},
    {"filename": "96812e9e-894f-4e0c-a0f5-168e06f77659_4.2_flightpath_cos__state_machine__proof_gates.pdf", "title": "Flightpath COS State Machine & Proof Gates", "category": "Flightpath", "description": "State machine and proof gate specifications for Flightpath COS."},
    {"filename": "61852e42-7072-4c17-a832-1dd2f7a00dae_4.3_mose__executive_creative__systems_brief.pdf", "title": "MOSE Executive Systems Brief", "category": "MOSE", "description": "Executive overview of the Multi-Operator Systems Engine."},
    {"filename": "acb17996-d940-427c-bd36-3b7492ac684c_4.4_mose__routing__escalation_logic_specification.pdf", "title": "MOSE Routing & Escalation Logic", "category": "MOSE", "description": "Specification for MOSE routing and escalation logic."},
    {"filename": "befedcb2-53da-4314-9c0a-268ce42d7e25_5.2_tela__executive__systems_brief.pdf", "title": "TELA Executive Systems Brief", "category": "TELA", "description": "Executive overview of the Trusted Efficiency Liaison Assistant."},
    {"filename": "3f6b84bc-8205-406a-9c69-6cd72a3fcd68_5.3_tela__action_catalog__adapter_specification.pdf", "title": "TELA Action Catalog & Adapter Specification", "category": "TELA", "description": "Action catalog and adapter specifications for TELA execution."},
    {"filename": "c09913ec-293e-40fb-8540-1d75cefe0536_3.1_pig_pen__canonical_operator_registry_(telauthorium-locked).pdf", "title": "Pig Pen Canonical Operator Registry", "category": "Pig Pen", "description": "Telauthorium-locked registry of non-human cognition operators."},
    {"filename": "e56f70ad-6274-46db-8476-84cb3d698e88_5.1_audit__event_ledger__canonical_specification.pdf", "title": "Audit Event Ledger Specification", "category": "Audit", "description": "Canonical specification for the immutable audit and event ledger."},
    {"filename": "d9a9a288-5bc2-4dbb-8da8-d76f2a343947_6.1_ecos__tenant-safe_executive__systems_brief__license_bundles.pdf", "title": "ECOS Tenant-Safe Executive Brief", "category": "ECOS", "description": "Executive overview of ECOS tenant deployments and license bundles."},
    {"filename": "1df31a37-5a36-4191-b029-36d18dcf381f_Failure_Halt__Re-Authorization_Protocol.pdf", "title": "Failure Halt & Re-Authorization Protocol", "category": "Enforcement", "description": "Protocol for handling system failures, halts, and re-authorization."},
]

# ============== Routes ==============

@api_router.get("/")
async def root():
    return {"message": "GoGarvis API", "version": "1.0.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# Status endpoints
@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks

# Documents endpoints
@api_router.get("/documents")
async def get_documents(category: Optional[str] = None, search: Optional[str] = None):
    documents = DOCUMENT_METADATA.copy()
    
    if category and category != "all":
        documents = [d for d in documents if d["category"].lower() == category.lower()]
    
    if search:
        search_lower = search.lower()
        documents = [d for d in documents if search_lower in d["title"].lower() or search_lower in d["description"].lower()]
    
    return {"documents": documents, "total": len(documents)}

@api_router.get("/documents/{filename}")
async def get_document_content(filename: str):
    # Find document metadata
    doc_meta = next((d for d in DOCUMENT_METADATA if d["filename"] == filename), None)
    if not doc_meta:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Try to extract text from PDF
    pdf_path = DOCS_PATH / filename
    if not pdf_path.exists():
        raise HTTPException(status_code=404, detail="PDF file not found")
    
    try:
        content = ""
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    content += text + "\n\n"
        
        return {
            **doc_meta,
            "content": content if content else "Content could not be extracted from this PDF."
        }
    except Exception as e:
        logger.error(f"Error reading PDF: {e}")
        return {
            **doc_meta,
            "content": f"Error extracting content: {str(e)}"
        }

@api_router.get("/documents/categories/list")
async def get_document_categories():
    categories = list(set(d["category"] for d in DOCUMENT_METADATA))
    return {"categories": sorted(categories)}

# Glossary endpoints
@api_router.get("/glossary")
async def get_glossary(category: Optional[str] = None, search: Optional[str] = None):
    terms = GLOSSARY_DATA.copy()
    
    if category and category != "all":
        terms = [t for t in terms if t["category"].lower() == category.lower()]
    
    if search:
        search_lower = search.lower()
        terms = [t for t in terms if search_lower in t["term"].lower() or search_lower in t["definition"].lower()]
    
    return {"terms": terms, "total": len(terms)}

@api_router.get("/glossary/categories")
async def get_glossary_categories():
    categories = list(set(t["category"] for t in GLOSSARY_DATA))
    return {"categories": sorted(categories)}

# Architecture endpoints
@api_router.get("/architecture/components")
async def get_architecture_components():
    return {"components": SYSTEM_COMPONENTS}

@api_router.get("/architecture/components/{component_id}")
async def get_component_detail(component_id: str):
    component = next((c for c in SYSTEM_COMPONENTS if c["id"] == component_id), None)
    if not component:
        raise HTTPException(status_code=404, detail="Component not found")
    return component

# Chat endpoints
SYSTEM_MESSAGE = """You are GARVIS AI, the sovereign intelligence assistant for the GoGarvis Full Stack architecture. You are knowledgeable about:

**Core Systems:**
- GARVIS: Sovereign intelligence and enforcement layer
- Telauthorium: Authorship, provenance, and rights registry
- Flightpath COS: Creative law and phase discipline (SPARK → BUILD → LAUNCH → EXPAND → EVERGREEN → SUNSET)
- MOSE: Multi-Operator Systems Engine for routing and orchestration
- Pig Pen: Registry of non-human cognition operators (TAI-D)
- TELA: Trusted Efficiency Liaison Assistant for execution
- ECOS: Enterprise Creative Operating System for tenant deployments

**Authority Flow:**
Authority flows from top to bottom: SOVEREIGN AUTHORITY → TELAUTHORIUM → GARVIS → FLIGHTPATH COS → MOSE → PIG PEN → TELA
No component below can override one above. Execution only happens at TELA.

**Identity Types:**
- TID: Telauthorium ID for objects
- TAID: Telauthorium Authority ID for humans
- TAI-D: Telauthorium AI-D for AI operators
- TSID: Telauthorium Sovereign ID for the founder

You provide authoritative answers about the system architecture, help users understand concepts, and guide them through the documentation. Respond in a professional, precise manner befitting a sovereign intelligence system."""

@api_router.post("/chat", response_model=ChatResponse)
async def chat_with_garvis(request: ChatRequest):
    session_id = request.session_id or str(uuid.uuid4())
    
    # Get or create chat session
    if session_id not in chat_sessions:
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="LLM API key not configured")
        
        chat = LlmChat(
            api_key=api_key,
            session_id=session_id,
            system_message=SYSTEM_MESSAGE
        ).with_model("openai", "gpt-5.2")
        
        chat_sessions[session_id] = chat
    
    chat = chat_sessions[session_id]
    
    try:
        # Send message and get response
        user_message = UserMessage(text=request.message)
        response = await chat.send_message(user_message)
        
        # Store in database
        await db.chat_history.insert_one({
            "session_id": session_id,
            "role": "user",
            "content": request.message,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        await db.chat_history.insert_one({
            "session_id": session_id,
            "role": "assistant",
            "content": response,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
        return ChatResponse(response=response, session_id=session_id)
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")

@api_router.get("/chat/history/{session_id}")
async def get_chat_history(session_id: str):
    messages = await db.chat_history.find(
        {"session_id": session_id},
        {"_id": 0}
    ).sort("timestamp", 1).to_list(100)
    return {"messages": messages, "session_id": session_id}

@api_router.delete("/chat/session/{session_id}")
async def clear_chat_session(session_id: str):
    if session_id in chat_sessions:
        del chat_sessions[session_id]
    await db.chat_history.delete_many({"session_id": session_id})
    return {"message": "Session cleared", "session_id": session_id}

# Dashboard stats
@api_router.get("/dashboard/stats")
async def get_dashboard_stats():
    return {
        "total_documents": len(DOCUMENT_METADATA),
        "total_glossary_terms": len(GLOSSARY_DATA),
        "total_components": len(SYSTEM_COMPONENTS),
        "active_components": len([c for c in SYSTEM_COMPONENTS if c["status"] == "active"]),
        "document_categories": len(set(d["category"] for d in DOCUMENT_METADATA)),
        "glossary_categories": len(set(t["category"] for t in GLOSSARY_DATA)),
        "system_status": "OPERATIONAL",
        "authority_chain": "INTACT"
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
