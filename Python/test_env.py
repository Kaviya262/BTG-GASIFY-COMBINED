import os
from dotenv import load_dotenv
load_dotenv()
print("DB_HOST from dotenv:", os.getenv("DB_HOST"))
print("DB_USER from dotenv:", os.getenv("DB_USER"))
