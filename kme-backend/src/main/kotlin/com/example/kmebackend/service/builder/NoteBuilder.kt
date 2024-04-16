package com.example.kmebackend.service.builder

import com.example.kmebackend.model.Accidental
import com.example.kmebackend.model.Chord
import com.example.kmebackend.model.Note
import com.example.kmebackend.model.NoteId
import com.example.kmebackend.service.NoteService

/**
 * A class that makes building [Notes][Note] easier and faster.
 */
class NoteBuilder internal constructor(
    private val chordBuilder: ChordBuilder,
    private val noteService: NoteService,
) {
    private var selectedNoteId: NoteId? = null

    private var accidental: Accidental? = null
    private var metadata: String? = null
    private var overrideMetadata: Boolean = false

    /**
     * Stores [newAccidental] that will be used to override the selected [Note's][Note] [Note.accidental].
     * @param newAccidental the data that will be used to override the selected [Note's][Note] [Note.accidental].
     * @return the same [NoteBuilder] instance that called this function.
     * @see save
     */
    fun setAccidental(newAccidental: Accidental): NoteBuilder {
        accidental = newAccidental
        return this
    }

    /**
     * Stores [newMetadata] that will be used to override the selected [Note's][Note] [Note.metadata].
     * @param newMetadata the data that will be used to override the selected [Note's][Note] [Note.metadata].
     * @return the same [NoteBuilder] instance that called this function.
     * @see save
     */
    fun setMetadata(newMetadata: String?): NoteBuilder {
        metadata = newMetadata
        overrideMetadata = true
        return this
    }

    /**
     * @return the selected [Note's][Note] ID.
     * @throws UnsupportedOperationException if no [Note] was selected.
     */
    fun getSelectedNoteId(): NoteId {
        if (selectedNoteId == null) {
            throw UnsupportedOperationException("A Note must be selected")
        }
        return requireNotNull(selectedNoteId)
    }

    /**
     * Overrides the data that has been set for the selected [Note] and then saves it.
     * The data that has been set is then discarded.
     * @return the same [NoteBuilder] instance that called this function
     * @throws UnsupportedOperationException if no [Note] was selected.
     */
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

    /**
     * Selects a [Note].
     * @param position the [position of the Note][NoteId.position] inside its parent [Chord].
     * @return the same [NoteBuilder] instance that called this function.
     * @throws NoSuchElementException if there was no [Note] found for the given [position].
     * @see insertAndSelectNote
     */
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

    /**
     * Creates, inserts and selects a [Note].
     * @param newNote the instance from where data will be copied to the new [Note]. Its ID is ignored.
     * @return the same [NoteBuilder] instance that called this function.
     * @see selectNote
     */
    fun insertAndSelectNote(newNote: Note): NoteBuilder {
        var note = noteService.insertInChord(requireNotNull(chordBuilder.selectedChordId), newNote)
        note = noteService.save(note)
        selectedNoteId = note.noteId
        return this
    }

    /**
     * Deletes the selected [Note].
     * @return the same [NoteBuilder] instance that called this function.
     * @throws UnsupportedOperationException if no [Note] was selected.
     * @see NoteService.deleteById
     */
    fun deleteSelectedNote(): NoteBuilder {
        if (selectedNoteId == null) {
            throw UnsupportedOperationException("A Note must be selected")
        }
        noteService.deleteById(requireNotNull(selectedNoteId))
        return this
    }

    /**
     * @return the instance of [ChordBuilder] that created this [NoteBuilder].
     */
    fun back(): ChordBuilder {
        return chordBuilder
    }
}