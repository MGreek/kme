package com.example.kmebackend.service

import com.example.kmebackend.model.*
import com.example.kmebackend.repository.ChordRepository
import com.example.kmebackend.repository.NoteRepository
import org.springframework.stereotype.Service

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
