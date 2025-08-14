'use client';

import { useState, useEffect } from 'react';
import { useGetCalls } from '@/hooks/useGetCalls';
import { CallRecording } from '@stream-io/video-react-sdk';
import { generateFormattedNotes, deleteNote } from '@/lib/ai_notes';
import Loader from '@/components/Loader';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface NoteData {
  content: string;
  recordingId?: string;
  createdAt?: Date;
}

const NotesPage = () => {
  const { callRecordings } = useGetCalls();
  const [notes, setNotes] = useState<Record<string, NoteData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndGenerateNotes = async () => {
      try {
        const callData = await Promise.all(
          callRecordings?.map((meeting) => meeting.queryRecordings()) ?? [],
        );

        const recordings = callData
          .filter((call) => call.recordings.length > 0)
          .flatMap((call) => call.recordings);

        const notesMap: Record<string, NoteData> = {};
        for (const recording of recordings) {
          const recordingKey = recording.filename || recording.url;
          if (!notesMap[recordingKey]) {
            const generatedNotes = await generateFormattedNotes(recording.url);
            notesMap[recordingKey] = {
              content: generatedNotes,
              recordingId: recording.filename,
              createdAt: new Date(),
            };
          }
        }

        setNotes(notesMap);
      } catch (error) {
        console.error('Error generating notes:', error);
        toast.error('Failed to generate some notes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndGenerateNotes();
  }, [callRecordings]);

  const formatRecordingName = (filename: string): string => {
    const withoutExt = filename.replace(/\.[^/.]+$/, "");
    const withSpaces = withoutExt.replace(/[_-]/g, ' ');
    return withSpaces.replace(/(\w)(\w*)/g, (_, first, rest) => 
      first.toUpperCase() + rest.toLowerCase()
    );
  };

  const handleDeleteClick = (filename: string) => {
    setNoteToDelete(filename);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (noteToDelete) {
      try {
        await deleteNote(noteToDelete);
        const { [noteToDelete]: _, ...updatedNotes } = notes;
        setNotes(updatedNotes);
        toast.success('Note deleted successfully');
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Failed to delete note');
      } finally {
        setDeleteDialogOpen(false);
        setNoteToDelete(null);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex size-full items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <section className="flex size-full flex-col gap-10 text-white">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Meeting Insights</h1>
        {Object.keys(notes).length > 0 && (
          <p className="text-gray-400">
            {Object.keys(notes).length} note{Object.keys(notes).length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
      
      <div className="space-y-8">
        {Object.entries(notes).length > 0 ? (
          Object.entries(notes).map(([filename, noteData]) => (
            <div
              key={filename}
              className="bg-dark-1 rounded-xl p-6 shadow-lg relative group hover:ring-2 hover:ring-blue-500/50 transition-all"
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:bg-red-900/30"
                onClick={() => handleDeleteClick(filename)}
                aria-label="Delete note"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
              
              <h2 className="text-xl font-bold mb-4 text-blue-300 pr-8 truncate">
                {formatRecordingName(filename)}
              </h2>
              {noteData.createdAt && (
                <p className="text-gray-500 text-sm mb-4">
                  Created: {noteData.createdAt.toLocaleDateString()}
                </p>
              )}
              <div 
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: noteData.content }}
              />
            </div>
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-400">No meeting insights generated yet</p>
            <p className="text-gray-500 text-sm mt-2">
              Recordings will automatically appear here after processing
            </p>
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this note. You won't be able to recover it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 focus-visible:ring-red-800"
              onClick={handleConfirmDelete}
            >
              Delete Note
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};

export default NotesPage;