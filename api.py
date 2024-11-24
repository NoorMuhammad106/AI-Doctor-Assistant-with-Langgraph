from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from main import *
from typing import List
from pydantic import BaseModel

app = FastAPI()

# Configure CORS
origins = [
    "http://localhost:3000",  # Add your Next.js frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QuestionRequest(BaseModel):
    question: str

# In-memory storage for chat history
chat_history: List[dict] = []

@app.post("/ask")
async def ask_question(request: QuestionRequest):
    # Construct prompt template
    prompt_template = """
    You are a helpful medical assistant. Based on the content provided and previous discussions, give a clear and concise answer to the user’s question.
    Format the answer to be friendly and easy to understand.

    Previous Questions and Answers:
    {history}

    Question: {question}

    Document Content:
    {document_content}

    Answer:
    """

    inputs = {"question": request.question}

    # Prepare history for prompt
    history = "\n".join(
        [f"You: {entry['question']}\nAI: {entry['response']}" for entry in chat_history]
    ) if chat_history else "No previous discussions."

    for output in workflow.stream(inputs):
        for key, value in output.items():
            # Check if 'documents' is a list or a single Document or string
            if isinstance(value['documents'], list):
                if isinstance(value['documents'][0], str):  # If the first element is a string
                    document_content = value['documents'][0]
                elif hasattr(value['documents'][0], 'page_content'):  # If it's a Document object
                    document_content = value['documents'][0].page_content
                else:
                    document_content = "No valid content found."
            elif isinstance(value['documents'], str):
                # If it's a single string document
                document_content = value['documents']
            elif hasattr(value['documents'], 'page_content'):
                # If it's a single Document object
                document_content = value['documents'].page_content
            else:
                document_content = "No content found."

            # Format the prompt with history
            prompt = prompt_template.format(
                history=history,
                question=inputs["question"],
                document_content=document_content
            )

            # Get response from LLM
            response = llm([HumanMessage(content=prompt)])  # Adjust as per your llm implementation

            # Save the question and response to chat history
            chat_history.append({"question": inputs["question"], "response": response.content})

            return {"response": response.content}
