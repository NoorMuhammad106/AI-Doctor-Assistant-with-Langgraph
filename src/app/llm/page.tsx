"use client";

import { useState, FormEvent } from 'react';
import './styles.css'; // Import the CSS file

interface ApiResponse {
  response: string; // Adjust based on your actual API response structure
}

interface ChatEntry {
  question: string;
  response: string;
}

export default function Home() {
  const [data, setData] = useState<ApiResponse | null>(null); // Store the API response
  const [question, setQuestion] = useState<string>(''); // Store user's question
  const [isLoading, setIsLoading] = useState<boolean>(false); // Manage loading state
  const [error, setError] = useState<string | null>(null); // Handle errors
  const [chatHistory, setChatHistory] = useState<ChatEntry[]>([]); // Store chat history

  // Function to handle form submission
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form reload behavior

    if (!question) return; // Avoid submitting if the input is empty

    setIsLoading(true); // Set loading to true
    setError(null); // Reset any previous error

    // Create a context string from previous chat history
    const context = chatHistory
      .map((entry) => `Patient: ${entry.question}\nDoctor Assistant: ${entry.response}`)
      .join('\n');

    // Make the POST request to FastAPI
    fetch('http://localhost:8000/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question, context }), // Send the question and context
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok'); // Handle non-200 responses
        }
        return response.json();
      })
      .then((data: ApiResponse) => {
        console.log("Response received:", data); // Log the entire response
        setData(data); // Set the received data
        setChatHistory((prevHistory) => [
          ...prevHistory,
          { question, response: data.response } // Update chat history with question and response
        ]);
        setIsLoading(false); // Stop loading
        setQuestion(''); // Clear the input field after submission
      })
      .catch((error) => {
        console.error('Error:', error);
        setError('An error occurred while fetching the data.'); // Set error message
        setIsLoading(false); // Stop loading
      });
  };

  // Function to format the response
  const formatResponse = (response: string): string => {
    return response
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Handle bold text
      .replace(/\n/g, '<br />') // Replace line breaks with <br />
      .replace(/(\d+)\. /g, '<li>$1. ') // Replace numbered list indicators with <li>
      .replace(/(<li>.*?<\/li>)/g, '<ul>$1</ul>'); // Wrap in <ul>
  };

  return (
    <div className="container">
      <h1 className="header">AI Doctor Chatbot</h1>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)} // Update question state on input change
          placeholder="Type your question here"
          required
          className="input"
        />
        <button type="submit" className="submit-button">Submit</button>
      </form>

      {/* Display loading state */}
      {isLoading && <p className="loading">Loading...</p>}

      {/* Display error message if an error occurred */}
      {error && <p className="error">{error}</p>}

      {/* Display the chat history */}
      <div className="chat-history">
        {chatHistory.map((entry, index) => (
          <div key={index} className="chat-entry">
            <p className="patient-question"><strong>Patient:</strong> {entry.question}</p>
            <p className="doctor-response" dangerouslySetInnerHTML={{ __html: formatResponse(entry.response) }} />
          </div>
        ))}
      </div>
    </div>
  );
}
