package com.example.kmebackend.service

import com.example.kmebackend.model.*
import com.example.kmebackend.repository.ChordRepository
import com.example.kmebackend.repository.NoteRepository
import org.springframework.stereotype.Service
import java.util.*
import kotlin.NoSuchElementException

@Service
data class NoteService(
    val noteRepository: NoteRepository,
    val chordRepository: ChordRepository,
) {
    /**
     * A wrapper around NoteRepository::save
     */
    fun save(note: Note): Note {
        return noteRepository.save(note)
    }

    /**
     * A wrapper around NoteRepository::findById
     */
    fun findById(noteId: NoteId): Optional<Note> {
        return noteRepository.findById(noteId)
    }

    /**
     * A wrapper around NoteRepository::existsById
     */
    fun existsById(noteId: NoteId): Boolean {
        return noteRepository.existsById(noteId)
    }

    /**
     * Creates a new Note and inserts it in the Chord corresponding to chordId.
     * @param chordId must correspond to a saved Chord.
     * @param note the instance from where data is copied to the new Note. Its embedded ChordId is ignored.
     * @return a new Note that is inserted in the Chord corresponding to chordId.
     */
    fun insertInChord(
        chordId: ChordId,
        note: Note,
    ): Note {
        if (!chordRepository.existsById(chordId)) {
            throw NoSuchElementException("Staff with ID $chordId not found")
        }
        val newNoteId = NoteId(chordId, note.noteId.position)
        if (existsById(newNoteId)) {
            throw UnsupportedOperationException("Note with ID $newNoteId already exists")
        }
        val newNote =
            note.copy(
                noteId =
                    NoteId(
                        chordId,
                        note.noteId.position,
                    ),
                chord = chordRepository.findById(chordId).get(),
            )
        return newNote
    }
}
