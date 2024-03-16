package com.example.kmebackend.service.builder

import com.example.kmebackend.model.Accidental
import com.example.kmebackend.model.Note
import com.example.kmebackend.model.NoteId
import com.example.kmebackend.service.NoteService

class NoteBuilder internal constructor(
    private val chordBuilder: ChordBuilder,
    private val noteService: NoteService,
) {
    private var selectedNoteId: NoteId? = null

    private var accidental: Accidental? = null
    private var metadata: String? = null
    private var overrideMetadata: Boolean = false

    fun setAccidental(newAccidental: Accidental): NoteBuilder {
        accidental = newAccidental
        return this
    }

    fun setMetadata(newMetadata: String?): NoteBuilder {
        metadata = newMetadata
        overrideMetadata = true
        return this
    }

    fun save(): NoteBuilder {
        if (selectedNoteId == null) {
            throw UnsupportedOperationException("A Note must be selected")
        }
        var note = noteService.findById(requireNotNull(selectedNoteId)).orElseThrow()
        if (accidental != null) {
            note = note.copy(accidental = requireNotNull(accidental))
        }
        if (overrideMetadata) {
            note = note.copy(metadata = metadata)
        }
        noteService.save(note)
        return this
    }

    fun selectNote(position: Int): NoteBuilder {
        val noteId =
            NoteId(
                chordId = requireNotNull(chordBuilder.selectedChordId),
                position = position,
            )
        if (!noteService.existsById(noteId)) {
            throw NoSuchElementException("Note with ID $noteId not found")
        }
        selectedNoteId = noteId
        return this
    }

    fun insertAndSelectNote(newNote: Note): NoteBuilder {
        var note = noteService.insertInChord(requireNotNull(chordBuilder.selectedChordId), newNote)
        note = noteService.save(note)
        selectedNoteId = note.noteId
        return this
    }

    fun back(): ChordBuilder {
        return chordBuilder
    }
}
