"use client"

import ChatComponent from './ChatComponent';
import React, { useState, useEffect, useCallback } from 'react';
import { convertFileToBase64 } from './utils/convertFileToBase64';
import marked from 'marked';
import OpenAI from 'openai'; // Step 1: Import the OpenAI library

// The main App component
const App: React.FC = () => {
  // State management for various functionalities
  const [file, setFile] = useState<File | null>(null); // Holds the selected image file
  const [preview, setPreview] = useState<string>(''); // URL for the image preview
  const [statusMessage, setStatusMessage] = useState<string>(''); // Displays status messages to the user
  const [uploadProgress, setUploadProgress] = useState<number>(0); // Manages the upload progress
  const [dragOver, setDragOver] = useState<boolean>(false); // UI state for drag-and-drop
  const [textInput, setTextInput] = useState<string>(''); // Custom text input by the user
  const [maxTokens, setMaxTokens] = useState<number>(200); // Max tokens for analysis
  const [base64Image, setBase64Image] = useState<string>('');

  // Add new state variables for each result container
  const [result1, setResult1] = useState<string>('');
  const [result2, setResult2] = useState<string>('');
  const [result3, setResult3] = useState<string>('');
  const [chatCompletionResult, setChatCompletionResult] = useState<string>(''); // Step 5: Add a new state variable for the chat completion result

  // New state variable for trial count
  const [trialCount, setTrialCount] = useState<number>(0);

  // Load trial count from local storage when component mounts
  useEffect(() => {
    const storedTrialCount = localStorage.getItem('trialCount');
    if (storedTrialCount) {
      setTrialCount(Number(storedTrialCount));
    }
  }, []);

  // Names
  const resultNames = [
    "Personality Traits",
    "MBTI Likes and Dislikes",
    "MBTI-Match Response"
  ];

  // Callback for handling file selection changes
  const handleFileChange = useCallback(async (selectedFile: File) => {
    // Updating state with the new file and its preview URL
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setStatusMessage('Image selected. Click "Analyze" to proceed.');
    setUploadProgress(0);

    // Convert the file to a base64 string and store it in the state
    const base64 = await convertFileToBase64(selectedFile);
    setBase64Image(base64);
  }, []);

  // Function to handle submission for image analysis
  const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    if (!file) {
      setStatusMessage('No file selected!');
      return;
    }

    // Step 2: Initialize the OpenAI client inside the handleSubmit function
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });

    // Check trial count before proceeding
    if (trialCount >= 200) { // Changed from 1 to 2
      if (window.confirm("ola, would you like to support and buy lifetime access for $2.99? For feedback email reallycoolapp7@gmail.com")) {
        // Redirect to Stripe payment page
        window.location.href = 'https://buy.stripe.com/3cs7uB92D10G1IQ289';
      }
      return;
    }

    setStatusMessage('Processing');
    setUploadProgress(20); // Adjust progress after image conversion

    // Define an array of prompts
    const prompts = [
    // responses
   //mbti   
      "you're an expert person analyzer. describe some of the personality characteristics of the person im talking to. see screenshot. give it to me in five bullet points.",
      "what is ten times ten",
      "you are an expert person analyzer. guess the MBTI of this person. your answer has to be framed in this way first line is 1) guess the MBTI of this person. you have to say it in the way *they are likely to be * + 4 characters of the MBTI. the second line of the answer 2) what is the right way to respond to this person, based on their MBTI personality,"
    ];

    // Send a POST request to your API endpoint for each prompt
    const responses = await Promise.all(prompts.map(prompt =>
      fetch('/api/upload_gpt4v', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          file: base64Image, 
          prompt, 
          detail: undefined, 
          max_tokens: maxTokens 
        }),
      })
    ).concat(
      // Step 3: Add the new API call to the chat completions model inside the Promise.all call
      openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant.'
          },
          {
            role: 'user',
            content: 'what is two times four'
          }
        ]
      })
    ));

    setUploadProgress(60); // Progress after sending requests

    // Check if all requests were successful
    if (responses.some(response => !response.ok)) {
      throw new Error(`HTTP error! status: ${responses.find(response => !response.ok)?.status}`);
    }

    // Get the analysis results
    const apiResponses = await Promise.all(responses.map(response => response.json()));
    setUploadProgress(80); // Progress after receiving responses

    // Check if all analyses were successful
    if (apiResponses.some(apiResponse => !apiResponse.success)) {
      setStatusMessage(apiResponses.find(apiResponse => !apiResponse.success)?.message);
      return;
    }

    // Update the results
    if (apiResponses[0]) setResult1(apiResponses[0].analysis);
    if (apiResponses[1]) setResult2(apiResponses[1].analysis);
    if (apiResponses[2]) setResult3(apiResponses[2].analysis);

    // Step 4: Extract the assistant's reply from the response with error handling
    const chatCompletionResponse = apiResponses[apiResponses.length - 1];
    if (chatCompletionResponse && chatCompletionResponse.choices && chatCompletionResponse.choices[0] && chatCompletionResponse.choices[0].message) {
      const chatCompletion = chatCompletionResponse.choices[0].message.content;
      setChatCompletionResult(chatCompletion);
    } else {
      console.error('Unexpected response from chat completions API:', chatCompletionResponse);
    }

    setStatusMessage('Analysis complete.');
    setUploadProgress(100); // Final progress

    // Increment trial count after successful analysis
    const newTrialCount = trialCount + 1;
    setTrialCount(newTrialCount);
    localStorage.setItem('trialCount', String(newTrialCount));
  };

  // Callbacks for handling drag-and-drop events
  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    const files = event.dataTransfer.files;
    if (files.length) {
      handleFileChange(files[0]);
    }
  }, [handleFileChange]);

  // JSX for the component rendering

  return (
    <div className="flex">
      <div className="text-center mx-auto my-5 p-5 max-w-full">
        <h1 className="text-xl font-bold mb-5">MBTI Analyzer 😊👋 </h1>
  
        {/* Slider to select the max tokens */}
        <p className="text-sm text-gray-600 mb-1">Max tokens: {maxTokens}</p>
        <input 
          type="range" 
          min="200" 
          max="800" 
          value={maxTokens} 
          onChange={(e) => setMaxTokens(Number(e.target.value))} 
          className="mb-5"
        />

        {/* Display the number of trials left */}
        <p className="text-sm text-gray-600 mb-1">Trials left: {200 - trialCount}</p> 

      <div 
        className={`border-2 border-dashed border-gray-400 rounded-lg p-10 cursor-pointer mb-5 ${dragOver ? 'border-blue-300 bg-gray-100' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('fileUpload')?.click()}
      >
        <input 
          id="fileUpload"
          type="file" 
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFileChange(e.target.files[0]);
            }
          }}
          accept="image/*" 
          className="hidden" 
        />
        {preview ? (
          <img src={preview} alt="Preview" className="max-w-full max-h-48 mb-5 mx-auto" />
        ) : (
          <p>Drag and drop a screenshot of your chat here, or click to select an image to upload.</p>
        )}
      </div>
      <div className="flex justify-center items-center mb-5">
        {uploadProgress === 0 || uploadProgress === 100 ? (
          <button onClick={handleSubmit} className="bg-blue-500 text-white py-2 px-5 rounded-lg cursor-pointer text-lg hover:bg-blue-700">
            Analyze
          </button>
        ) : (
          <progress value={uploadProgress} max="100" className="w-1/2"></progress>
        )}
      </div>
      {statusMessage && <p className="text-gray-600 mb-5">{statusMessage}</p>}
      
      {result1 && result2 && result3 && (
        <div className="flex flex-wrap justify-between mt-5">
          {[result1, result2, result3].map((result, index) => (
            <div key={index} className="w-full sm:w-1/2 lg:w-1/3 p-2">
              <strong>{resultNames[index]}:</strong>
              <div className="w-full h-45 p-2 mt-2 border border-gray-300 rounded-lg resize-y overflow-auto">
                {result}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Step 7: Display the chat completion result in your JSX */}
      {chatCompletionResult && (
        <div>
          <strong>Chat Completion Result:</strong>
          <p>{chatCompletionResult}</p>
        </div>
      )}
    </div>
  </div>
);

}

export default App;