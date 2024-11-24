from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import bcrypt
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database configuration
DATABASE_URL = "postgresql://postgres:123456@localhost:5432/aidoctor"

# Create a new SQLAlchemy engine and session
try:
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    # Test the connection (optional)
    with engine.connect() as connection:
        pass
except Exception as e:
    logger.error(f"Database connection error: {e}")

Base = declarative_base()

# Create the FastAPI app
app = FastAPI()

# Add CORS middleware to allow frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # In production, specify your frontend's domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database model for user
class UserDB(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)

# Create the database tables
Base.metadata.create_all(bind=engine)

# Dependency to get the DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Define the Pydantic model for signup input validation
class User(BaseModel):
    username: str
    email: str
    password: str

    @validator('password')
    def password_must_be_valid(cls, password):
        if len(password) < 8:
            raise ValueError('Password must be at least 8 characters long.')
        if not any(char.isalpha() for char in password) or not any(char.isdigit() for char in password):
            raise ValueError('Password must contain both letters and numbers.')
        return password

# Define the Pydantic model for login input validation
class LoginRequest(BaseModel):
    username: str
    password: str

# Response models
class SignupResponse(BaseModel):
    message: str

class LoginResponse(BaseModel):
    message: str

# Signup endpoint
@app.post("/signup", response_model=SignupResponse)
async def signup(user: User, db: Session = Depends(get_db)):
    hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt(rounds=12)).decode('utf-8')

    # Check if the user already exists
    existing_user = db.query(UserDB).filter(UserDB.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists.")

    # Create a new user
    new_user = UserDB(
        username=user.username,
        email=user.email,
        password=hashed_password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    logger.info(f"New user created: {new_user.username}")
    return SignupResponse(message="User created successfully!")

# Login endpoint
@app.post("/login", response_model=LoginResponse)
async def login(user: LoginRequest, db: Session = Depends(get_db)):
    # Check if the username exists
    db_user = db.query(UserDB).filter(UserDB.username == user.username).first()
    if db_user is None:
        raise HTTPException(status_code=400, detail="Invalid username or password.")

    # Verify the password
    if not bcrypt.checkpw(user.password.encode('utf-8'), db_user.password.encode('utf-8')):
        raise HTTPException(status_code=400, detail="Invalid username or password.")

    logger.info(f"User logged in: {db_user.username}")
    return LoginResponse(message="Login successful!")

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Welcome to the AI Doctor FastAPI backend!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)
