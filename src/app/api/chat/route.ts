import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from 'path';

// Handles POST requests
export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Create a Promise to handle the Python process
    const response = await new Promise((resolve, reject) => {
      // Get the absolute path to the Python script
      const scriptPath = path.join(process.cwd(), 'scripts', 'deepseek_agent.py');
      
      // Spawn Python process with the script
      const pythonProcess = spawn('python', [scriptPath, message]);
      
      let outputData = '';
      let errorData = '';

      // Collect stdout data
      pythonProcess.stdout.on('data', (data) => {
        outputData += data.toString();
      });

      // Collect stderr data
      pythonProcess.stderr.on('data', (data) => {
        errorData += data.toString();
      });

      // Handle process completion
      pythonProcess.on('close', (code) => {
        if (code === 0 && outputData) {
          try {
            const jsonResponse = JSON.parse(outputData);
            resolve(jsonResponse);
          } catch (e) {
            resolve({ response: outputData.trim() });
          }
        } else {
          reject(new Error(errorData || 'Failed to get response from agent'));
        }
      });

      // Handle process errors
      pythonProcess.on('error', (err) => {
        reject(new Error(`Failed to start Python process: ${err.message}`));
      });
    });

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}
