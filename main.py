
from langchain_community.utilities import WikipediaAPIWrapper
from langchain_community.tools import WikipediaQueryRun
from langgraph.graph import END, StateGraph, START
from langchain.schema import Document, HumanMessage
from langchain_groq import ChatGroq
from typing_extensions import TypedDict
from typing import List
from db import *




retriever = astra_vector_store.as_retriever()

from typing import Literal
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field

# Data model
class RouteQuery(BaseModel):
    """Route a user query to the most relevant datasource."""
    datasource: Literal["vectorstore", "wiki_search"] = Field(
        ...,
        description="Given a user question, choose to route it to Wikipedia or a vectorstore.",
    )

# LLM with function call

import os

llm = ChatGroq(
    model_name="llama-3.1-70b-versatile",
    temperature=0,
    groq_api_key="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",
)

structured_llm_router = llm.with_structured_output(RouteQuery)

# Prompt
system =  """  You are a highly knowledgeable and concise medical assistant responsible for routing user questions 
to either a vectorstore or Wikipedia. The vectorstore contains medical documents covering topics such as diseases, 
treatments, symptoms, and medications. Use the vectorstore for questions related to these topics. 
For all other general medical questions or those requiring external information, route the query to Wikipedia. 
Always provide relevant, accurate, and clear responses, avoiding unnecessary details or unrelated information.
 """

route_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "{question}"),
    ]
)

question_router = route_prompt | structured_llm_router




# Wikipedia API wrapper setup
api_wrapper = WikipediaAPIWrapper(top_k_results=1, doc_content_chars_max=200)
wiki = WikipediaQueryRun(api_wrapper=api_wrapper)


# Graph state
class GraphState(TypedDict):
    question: str
    generation: str
    documents: List[str]


def retrieve(state):
    question = state["question"]
    documents = retriever.invoke(question)
    return {"documents": documents[0].page_content, "question": question}


def wiki_search(state):
    question = state["question"]
    docs = wiki.invoke({"query": question})
    wiki_results = Document(page_content=docs)
    return {"documents": wiki_results, "question": question}





def route_question(state):
    question = state["question"]
    source = question_router.invoke({"question": question})
    if source.datasource == "wiki_search":
        return "wiki_search"
    elif source.datasource == "vectorstore":
        return "vectorstore"


# Workflow setup
workflow = StateGraph(GraphState)
workflow.add_node("wiki_search", wiki_search)
workflow.add_node("retrieve", retrieve)
workflow.add_conditional_edges(START, route_question, {"wiki_search": "wiki_search", "vectorstore": "retrieve"})
workflow.add_edge("retrieve", END)
workflow.add_edge("wiki_search", END)
workflow = workflow.compile()

