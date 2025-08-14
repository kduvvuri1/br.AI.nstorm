import { transcribeAudio } from './transcription-service';

interface MeetingNotes {
  title: string;
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  decisions: string[];
  participants?: string[];
}

export async function generateFormattedNotes(recordingUrl: string): Promise<string> {
  try {
    const transcription = await transcribeAudio(recordingUrl);
    
    if (transcription.includes("doesn't contain any audio")) {
      return noAudioContentHTML();
    }

    // Instead of generating sample notes, return a message that no notes were created
    return noNotesCreatedHTML();

  } catch (error) {
    console.error('Note generation error:', error);
    return errorMessageHTML(error);
  }
}

function noNotesCreatedHTML(): string {
  return `
    <div class="bg-dark-2 p-6 rounded-lg text-center">
      <h2 class="text-xl font-bold text-gray-300 mb-2">No Notes Created</h2>
      <p class="text-gray-400">The audio quality wasn't sufficient to generate meeting notes.</p>
    </div>
  `;
}

function noAudioContentHTML(): string {
  return `
    <div class="bg-yellow-900/20 p-4 rounded-lg border border-yellow-700">
      <h2 class="text-xl font-bold text-yellow-300 mb-2">Audio Not Clear</h2>
      <p>This recording doesn't contain any processable audio.</p>
    </div>
  `;
}

function errorMessageHTML(error: unknown): string {
  return `
    <div class="bg-red-900/20 p-4 rounded-lg border border-red-700">
      <h2 class="text-xl font-bold text-red-300 mb-2">Processing Error</h2>
      <p>${error instanceof Error ? error.message : 'Failed to generate notes'}</p>
    </div>
  `;
}

export async function deleteNote(noteId: string): Promise<void> {
  if (typeof window !== 'undefined') {
    const savedNotes = JSON.parse(localStorage.getItem('meeting-notes') || '{}');
    delete savedNotes[noteId];
    localStorage.setItem('meeting-notes', JSON.stringify(savedNotes));
  }
}