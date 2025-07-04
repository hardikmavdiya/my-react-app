// frontend/src/App.tsx
import React, { useState } from 'react';
import './App.css'; // Import the CSS file for styling

function App() {
  // State variables to hold form input values
  const [niche, setNiche] = useState<string>('');
  const [successfulContentTypes, setSuccessfulContentTypes] = useState<string>('');
  const [platformType, setPlatformType] = useState<string>('');

  // State variables to manage the output and UI feedback
  const [ideas, setIdeas] = useState<string>('');
  const [parsedIdeas, setParsedIdeas] = useState<{ title: string; description: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [copyMessage, setCopyMessage] = useState<string>('');

  /**
   * Parses the raw text output from Gemini into a structured array of ideas.
   * Assumes the format "Idea X: [Title]\nDescription: [Description]"
   * @param rawText The raw string response from the Gemini API.
   * @returns An array of objects, each with a title and description.
   */
  const parseGeminiIdeas = (rawText: string) => {
    const ideasArray: { title: string; description: string }[] = [];
    // Split the text by "Idea X:" to get individual idea blocks
    const ideaBlocks = rawText.split(/(Idea \d+:)/).filter(Boolean); // Filter out empty strings

    for (let i = 0; i < ideaBlocks.length; i += 2) {
      if (ideaBlocks[i].startsWith('Idea') && ideaBlocks[i + 1]) {
        const blockContent = ideaBlocks[i + 1].trim();
        const titleMatch = blockContent.match(/(.*?)\nDescription: (.*)/s); // Use /s for dotall
        if (titleMatch && titleMatch.length >= 3) {
          const title = titleMatch[1].trim();
          const description = titleMatch[2].trim();
          ideasArray.push({ title, description });
        } else {
          // Fallback if parsing fails for a block, just add as raw text
          ideasArray.push({ title: "Unparsed Idea", description: blockContent });
        }
      }
    }
    return ideasArray;
  };

  /**
   * Handles the form submission.
   * Prevents default form behavior, sends data to the backend,
   * and updates the UI based on the response.
   * @param event The form submission event.
   */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent the browser from reloading the page

    // Reset previous states and show loading indicator
    setLoading(true);
    setError('');
    setIdeas('');
    setParsedIdeas([]);
    setCopyMessage('');

    try {
      // Make a POST request to your Flask backend API endpoint
      const response = await fetch('https://flask-gemini-backend-138659766439.asia-south1.run.app/api/generate_ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Specify that we are sending JSON data
        },
        // Convert the form data into a JSON string for the request body
        body: JSON.stringify({
          niche,
          successful_content_types: successfulContentTypes,
          platform_type: platformType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const rawIdeas = data.ideas;
      setIdeas(rawIdeas);
      setParsedIdeas(parseGeminiIdeas(rawIdeas));

    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching ideas:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Copies the generated ideas (raw text) to the clipboard.
   */
  const copyToClipboard = () => {
    if (ideas) {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = ideas;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setCopyMessage('Copied to clipboard!');
        setTimeout(() => setCopyMessage(''), 3000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
        setCopyMessage('Failed to copy!');
      }
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Content Idea Generator</h1>
        <p>Get creative content ideas for your social media platforms!</p>

        <form onSubmit={handleSubmit} className="idea-form">
          <div className="form-group">
            <label htmlFor="niche">Niche (e.g., "Sustainable Living", "Tech Gadgets"):</label>
            <input
              type="text"
              id="niche"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              required
              placeholder="e.g., Fitness, Gaming, Cooking"
            />
          </div>

          <div className="form-group">
            <label htmlFor="successfulContentTypes">Successful Content Types (comma-separated, e.g., "DIY guides, product reviews"):</label>
            <input
              type="text"
              id="successfulContentTypes"
              value={successfulContentTypes}
              onChange={(e) => setSuccessfulContentTypes(e.target.value)}
              placeholder="e.g., Tutorials, Vlogs, Short-form videos"
            />
          </div>

          <div className="form-group">
            <label htmlFor="platformType">Platform Type (e.g., "YouTube", "Instagram", "TikTok"):</label>
            <input
              type="text"
              id="platformType"
              value={platformType}
              onChange={(e) => setPlatformType(e.target.value)}
              required
              placeholder="e.g., YouTube, Instagram, Blog"
            />
          </div>

          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Generating Ideas...' : 'Generate Ideas'}
          </button>
        </form>

        {error && <p className="error-message">Error: {error}</p>}

        {parsedIdeas.length > 0 && (
          <div className="ideas-output">
            <h2>Generated Content Ideas:</h2>
            <button onClick={copyToClipboard} className="copy-button">
              <i className="fas fa-copy"></i> Copy All Ideas
            </button>
            {copyMessage && <span className="copy-message">{copyMessage}</span>}
            <div className="idea-list">
              {parsedIdeas.map((idea, index) => (
                <div key={index} className="idea-item">
                  <h3>{idea.title}</h3>
                  <p>{idea.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
