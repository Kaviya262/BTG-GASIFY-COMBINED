from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base

# 1. IMPORT THE ROUTERS
from .routers import finance, invoice_api, bankbook, procurement, ppp, claim_payment

app = FastAPI(title="Finance API (Python)")

# Allow CORS
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. INCLUDE THE ROUTERS

# Existing Finance Router
app.include_router(finance.router)

# Existing Invoice Router (Prefixed with /api)
app.include_router(invoice_api.router, prefix="/api", tags=["Invoices"])

# --- NEW: Include BankBook Router ---
# Since your request URL was /api/AR/..., we must add the /api prefix here too.
app.include_router(bankbook.router, prefix="/api", tags=["Bank Book"]) 

# Include Procurement Router
app.include_router(procurement.router, tags=["Procurement"]) 

# Include PPP Router
app.include_router(ppp.router, prefix="/api", tags=["Periodic Payment Plan"]) 

# Include Claim Payment Router
app.include_router(claim_payment.router) 


from .routers import pr_attachment
app.include_router(pr_attachment.router) 


@app.get("/")
def read_root():
    return {"message": "Finance API is running"}