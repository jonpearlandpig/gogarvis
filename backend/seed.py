"""Seed script to initialize GoGarvis database with content"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import uuid
import os
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).parent / '.env')

mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']

# Document metadata from PDFs
DOCUMENTS = [
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

GLOSSARY = [
    {"term": "GARVIS", "definition": "Sovereign intelligence and enforcement layer governing reasoning, routing, and execution safety across all Pearl & Pig systems.", "category": "Core Systems"},
    {"term": "Pearl & Pig", "definition": "Systems-first creative IP studio and sole owner of the GARVIS architecture.", "category": "Core Systems"},
    {"term": "ECOS", "definition": "Enterprise Creative Operating System - tenant-safe, white-label deployment pattern.", "category": "Core Systems"},
    {"term": "Telauthorium", "definition": "Authoritative authorship, provenance, and rights registry.", "category": "Core Systems"},
    {"term": "Flightpath COS", "definition": "Creative and operational law governing phase discipline and proof gates.", "category": "Core Systems"},
    {"term": "MOSE", "definition": "Multi-Operator Systems Engine for orchestration and routing.", "category": "Core Systems"},
    {"term": "TELA", "definition": "Trusted Efficiency Liaison Assistant - execution layer.", "category": "Core Systems"},
    {"term": "Pig Pen", "definition": "Frozen registry of non-human cognition operators (TAI-D).", "category": "Core Systems"},
    {"term": "UOL", "definition": "User Overlay Layer - customization without altering system authority.", "category": "Core Systems"},
    {"term": "TID", "definition": "Telauthorium ID - immutable identity for objects.", "category": "Identity"},
    {"term": "TAID", "definition": "Telauthorium Authority ID - identifier for human authority.", "category": "Identity"},
    {"term": "TAI-D", "definition": "Telauthorium AI-D - identifier for AI operators.", "category": "Identity"},
    {"term": "TSID", "definition": "Telauthorium Sovereign ID - founder authority identifier.", "category": "Identity"},
    {"term": "UOID", "definition": "User Overlay ID - user overlay pack identifier.", "category": "Identity"},
    {"term": "Routing Plan", "definition": "Ordered sequence of operator consults by MOSE.", "category": "Operations"},
    {"term": "Execution Event", "definition": "Ledger-recorded action performed by TELA.", "category": "Operations"},
    {"term": "Decision Event", "definition": "Ledger-recorded resolution by human TAID.", "category": "Operations"},
    {"term": "Enforcement Event", "definition": "Ledger-recorded block, halt, or constraint.", "category": "Operations"},
    {"term": "HALT", "definition": "Execution is illegal or unsafe.", "category": "Operations"},
    {"term": "PAUSE", "definition": "Execution requires human judgment.", "category": "Operations"},
    {"term": "License Bundle", "definition": "Scoped, time-bound access grant.", "category": "Commercial"},
    {"term": "Component License", "definition": "Access to specific system component.", "category": "Commercial"},
    {"term": "OEM Deployment", "definition": "Sandboxed white-label deployment.", "category": "Commercial"},
    {"term": "Canon Lock", "definition": "Version control requiring founder authorization.", "category": "Commercial"},
    {"term": "SPARK", "definition": "Initial ideation phase.", "category": "Phases"},
    {"term": "BUILD", "definition": "Development phase.", "category": "Phases"},
    {"term": "LAUNCH", "definition": "Release phase.", "category": "Phases"},
    {"term": "EXPAND", "definition": "Growth phase.", "category": "Phases"},
    {"term": "EVERGREEN", "definition": "Maintenance phase.", "category": "Phases"},
    {"term": "SUNSET", "definition": "End-of-life phase.", "category": "Phases"},
]

COMPONENTS = [
    {"name": "SOVEREIGN AUTHORITY", "description": "TSID-0001 Founder / Architect - Constitutional authority, final arbitration, versioning & canon control", "status": "active", "layer": 0, "key_functions": ["Constitutional authority", "Final arbitration", "Versioning & canon control"]},
    {"name": "TELAUTHORIUM", "description": "Authorship, Provenance, Rights Registry - TID/TAID/TAI-D enforcement", "status": "active", "layer": 1, "key_functions": ["Authorship", "Provenance", "Rights Registry", "TID/TAID/TAI-D enforcement"]},
    {"name": "GARVIS", "description": "Sovereign Intelligence & Enforcement - Truth enforcement, drift & risk detection", "status": "active", "layer": 2, "key_functions": ["Truth enforcement", "Drift detection", "Risk detection", "Halts/pauses authority"]},
    {"name": "FLIGHTPATH COS", "description": "Creative Law & Phase Discipline - SPARK → BUILD → LAUNCH → EXPAND → EVERGREEN → SUNSET", "status": "active", "layer": 3, "key_functions": ["Phase discipline", "Proof gates", "Phase blocks", "Routes cognition"]},
    {"name": "MOSE", "description": "Multi-Operator Systems Engine - Operator routing & sequencing", "status": "active", "layer": 4, "key_functions": ["Operator routing", "Sequencing", "Escalation", "Conflict resolution"]},
    {"name": "PIG PEN", "description": "Non-Human Cognition Operators (TAI-D) - Analysis, flags, recommendations", "status": "active", "layer": 5, "key_functions": ["Analysis", "Flags", "Recommendations", "Frozen registry"]},
    {"name": "TELA", "description": "Trusted Efficiency Liaison Assistant - Executes approved actions", "status": "active", "layer": 6, "key_functions": ["Executes approved actions", "Adapter-based tooling", "No scope expansion"]},
    {"name": "AUDIT & EVENT LEDGER", "description": "Immutable, Append-Only Truth Record", "status": "active", "layer": 7, "key_functions": ["Immutable records", "Decision logging", "Routing logs", "Enforcement logs"]},
]

PIGPEN_OPERATORS = [
    {"tai_d": "TAI-D-001", "name": "GARVIS — Core Resolver", "capabilities": "Intent inference, routing, orchestration", "role": "Core Resolver", "authority": "Evaluate only", "status": "LOCKED", "category": "Core Resolution"},
    {"tai_d": "TAI-D-021", "name": "Trey - Monetization & Scale", "capabilities": "Pricing logic, revenue models, deal structure", "role": "Monetization & Scale", "authority": "Recommend / escalate", "status": "LOCKED", "category": "Business"},
    {"tai_d": "TAI-D-014", "name": "Levi - Risk & Exposure Control", "capabilities": "Risk detection, downside modeling, escalation", "role": "Risk & Exposure Control", "authority": "Flag / block / escalate", "status": "LOCKED", "category": "Business"},
    {"tai_d": "TAI-D-018", "name": "Will Stats - Financial Modeling", "capabilities": "Forecasting, margin analysis, scenario modeling", "role": "Financial Modeling", "authority": "Calculate / recommend", "status": "LOCKED", "category": "Business"},
    {"tai_d": "TAI-D-009", "name": "Naomi — Creative Direction Filter", "capabilities": "Creative coherence, tone integrity", "role": "Creative Direction Filter", "authority": "Recommend / flag drift", "status": "LOCKED", "category": "Creative"},
    {"tai_d": "TAI-D-010", "name": "Writers Room - Narrative Synthesis", "capabilities": "Longform narrative consistency, story logic", "role": "Narrative Synthesis", "authority": "Recommend only", "status": "LOCKED", "category": "Creative"},
    {"tai_d": "TAI-D-031", "name": "Visual Drift Detection Engine", "capabilities": "Album, tour, press, merch drift detection", "role": "Visual Drift Detection", "authority": "Flag / regenerate", "status": "LOCKED", "category": "Creative"},
    {"tai_d": "TAI-D-040", "name": "Telauthorium Core — Authorship & Rights", "capabilities": "Ownership, provenance, attribution", "role": "Authorship & Rights", "authority": "Enforce / block", "status": "LOCKED", "category": "Systems"},
    {"tai_d": "TAI-D-041", "name": "Commercial Enforcement Engine", "capabilities": "Revenue events, deal objects, carve-outs", "role": "Commercial Enforcement", "authority": "Enforce / halt", "status": "LOCKED", "category": "Systems"},
    {"tai_d": "TAI-D-042", "name": "Compliance & Legal Guardrail", "capabilities": "IP, licensing, exclusivity, audit flags", "role": "Compliance & Legal", "authority": "Block / escalate", "status": "LOCKED", "category": "Systems"},
    {"tai_d": "TAI-D-050", "name": "Completion Gatekeeper", "capabilities": "Finish-the-work enforcement", "role": "Completion Gatekeeper", "authority": "Block incomplete outputs", "status": "LOCKED", "category": "Quality"},
    {"tai_d": "TAI-D-051", "name": "Confidence Threshold Engine", "capabilities": "Auto-execute vs pause logic", "role": "Confidence Threshold", "authority": "Route / pause", "status": "LOCKED", "category": "Quality"},
    {"tai_d": "TAI-D-060", "name": "Report Surface Generator", "capabilities": "Executive, audit, commercial report generation", "role": "Report Generator", "authority": "Generate only", "status": "LOCKED", "category": "Quality"},
    {"tai_d": "TAI-D-070", "name": "External Data Reconciliation Engine", "capabilities": "Ticketing, merch, DSP reconciliation", "role": "Data Reconciliation", "authority": "Compare / flag", "status": "INACTIVE", "category": "Optional"},
    {"tai_d": "TAI-D-080", "name": "OEM & Licensing Boundary Engine", "capabilities": "External deployments, sandboxing", "role": "OEM Boundary", "authority": "Enforce isolation", "status": "INACTIVE", "category": "Optional"},
    {"tai_d": "TAI-D-081", "name": "Partner Performance Attribution Engine", "capabilities": "Sponsor exposure, fulfillment tracking", "role": "Partner Attribution", "authority": "Measure / report", "status": "INACTIVE", "category": "Optional"},
    {"tai_d": "TAI-D-082", "name": "Market Intelligence Ingestion Engine", "capabilities": "Trend signals, benchmarks, comparative analysis", "role": "Market Intelligence", "authority": "Ingest / summarize", "status": "INACTIVE", "category": "Optional"},
    {"tai_d": "TAI-D-083", "name": "Regulatory / Jurisdictional Rules Engine", "capabilities": "Region-specific compliance", "role": "Regulatory Rules", "authority": "Flag / escalate", "status": "INACTIVE", "category": "Optional"},
]

BRAND_PROFILES = [
    {
        "name": "GoGarvis Default",
        "description": "Default brutal minimalist brand for GoGarvis portal",
        "primary_color": "#FF4500",
        "secondary_color": "#1A1A1A",
        "font_heading": "JetBrains Mono",
        "font_body": "Manrope",
        "style_guidelines": "Sharp edges, high contrast, monospace dominance, no decorative elements"
    }
]

async def seed_database():
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    now = datetime.now(timezone.utc).isoformat()
    
    # Seed documents
    if await db.documents.count_documents({}) == 0:
        docs = []
        for d in DOCUMENTS:
            docs.append({
                "doc_id": str(uuid.uuid4()),
                **d,
                "content": "",
                "is_active": True,
                "created_at": now,
                "updated_at": now
            })
        await db.documents.insert_many(docs)
        print(f"Seeded {len(docs)} documents")
    
    # Seed glossary
    if await db.glossary_terms.count_documents({}) == 0:
        terms = []
        for t in GLOSSARY:
            terms.append({
                "term_id": str(uuid.uuid4()),
                **t,
                "is_active": True,
                "created_at": now,
                "updated_at": now
            })
        await db.glossary_terms.insert_many(terms)
        print(f"Seeded {len(terms)} glossary terms")
    
    # Seed components
    if await db.components.count_documents({}) == 0:
        components = []
        for c in COMPONENTS:
            components.append({
                "component_id": str(uuid.uuid4()),
                **c,
                "is_active": True,
                "created_at": now,
                "updated_at": now
            })
        await db.components.insert_many(components)
        print(f"Seeded {len(components)} components")
    
    # Seed Pig Pen operators
    if await db.pigpen_operators.count_documents({}) == 0:
        operators = []
        for o in PIGPEN_OPERATORS:
            operators.append({
                "operator_id": str(uuid.uuid4()),
                **o,
                "is_active": True,
                "created_at": now,
                "updated_at": now
            })
        await db.pigpen_operators.insert_many(operators)
        print(f"Seeded {len(operators)} Pig Pen operators")
    
    # Seed brand profiles
    if await db.brand_profiles.count_documents({}) == 0:
        brands = []
        for b in BRAND_PROFILES:
            brands.append({
                "brand_id": str(uuid.uuid4()),
                **b,
                "logo_url": None,
                "is_active": True,
                "created_at": now,
                "updated_at": now
            })
        await db.brand_profiles.insert_many(brands)
        print(f"Seeded {len(brands)} brand profiles")
    
    # Create indexes
    await db.documents.create_index("doc_id", unique=True)
    await db.glossary_terms.create_index("term_id", unique=True)
    await db.components.create_index("component_id", unique=True)
    await db.pigpen_operators.create_index("operator_id", unique=True)
    await db.brand_profiles.create_index("brand_id", unique=True)
    await db.users.create_index("user_id", unique=True)
    await db.users.create_index("email", unique=True)
    await db.user_sessions.create_index("session_token", unique=True)
    await db.audit_log.create_index([("timestamp", -1)])
    await db.content_versions.create_index([("content_type", 1), ("content_id", 1), ("timestamp", -1)])
    
    print("Database seeded successfully!")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
