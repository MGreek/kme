package com.example.kmebackend.service.builder

import com.example.kmebackend.model.*
import com.example.kmebackend.service.ChordService
import com.example.kmebackend.service.NoteService
import jakarta.validation.Valid

/**
 * A class that makes building [Chords][Chord] easier and faster.
 */
class ChordBuilder internal constructor(
    private val groupingBuilder: GroupingBuilder,
    private val chordService: ChordService,
    private val noteService: NoteService,
) {
    internal var selectedChordId: ChordId? = null

    private var metadata: String? = null
    private var overrideMetadata: Boolean = false
    private var stemType: StemType? = null
    private var stemMetadata: String? = null
    private var overrideStemMetadata: Boolean = false
    private var dotCount: Long? = null

    /**
     * Stores [newMetadata] that will be used to override the selected [Chord's][Chord] [Chord.metadata].
     * @param newMetadata the data that will be used to override the selected [Chord's][Chord] [Chord.metadata].
     * @return the same [ChordBuilder] instance that called this function.
     * @see save
     */
    fun setMetadata(newMetadata: String?): ChordBuilder {
        metadata = newMetadata
        overrideMetadata = true
        return this
    }

    /**
     * Stores [newStemType] that will be used to override the selected [Chord's][Chord] [stemType][Stem.stemType].
     * @param newStemType the data that will be used to override the selected [Chord's][Chord] [stemType][Stem.stemType].
     * @return the same [ChordBuilder] instance that called this function.
     * @see save
     */
    fun setStemType(newStemType: StemType): ChordBuilder {
        stemType = newStemType
        return this
    }

    /**
     * Stores [newStemMetadata] that will be used to override the selected [Chord's][Chord] [stemMetadata][Stem.metadata].
     * @param newStemMetadata the data that will be used to override the selected [Chord's][Chord] [stemMetadata][Stem.metadata].
     * @return the same [ChordBuilder] instance that called this function.
     * @see save
     */
    fun setStemMetadata(newStemMetadata: String?): ChordBuilder {
        stemMetadata = newStemMetadata
        overrideStemMetadata = true
        return this
    }

    /**
     * Stores [newDotCount] that will be used to override the selected [Chord's][Chord] [Chord.dotCount].
     * @param newDotCount the data that will be used to override the selected [Chord's][Chord] [Chord.dotCount].
     * @return the same [ChordBuilder] instance that called this function.
     * @see save
     */
    fun setDotCount(newDotCount: Long): ChordBuilder {
        dotCount = newDotCount
        return this
    }

    /**
     * @return the selected [Chord's][Chord] ID.
     * @throws UnsupportedOperationException if no [Chord] was selected.
     */
    fun getSelectedChordId(): ChordId {
        if (selectedChordId == null) {
            throw UnsupportedOperationException("A Chord must be selected")
        }
        return requireNotNull(selectedChordId)
    }

    /**
     * Overrides the data that has been set for the selected [Chord] and then saves it.
     * The data that has been set is then discarded.
     * @return the same [ChordBuilder] instance that called this function.
     * @throws UnsupportedOperationException if no [Chord] was selected.
     */
    fun save(): ChordBuilder {
        if (selectedChordId == null) {
            throw UnsupportedOperationException("A Chord must be selected")
        }
        var chord = chordService.findById(requireNotNull(selectedChordId)).orElseThrow()
        if (overrideMetadata) {
            chord = chord.copy(metadata = metadata)
        }
        overrideMetadata = false
        if (stemType != null) {
            chord = chord.copy(stem = chord.stem.copy(stemType = requireNotNull(stemType)))
        }
        stemType = null
        if (overrideStemMetadata) {
            chord = chord.copy(stem = chord.stem.copy(metadata = stemMetadata))
        }
        overrideStemMetadata = false
        if (dotCount != null) {
            chord = chord.copy(dotCount = requireNotNull(dotCount))
        }
        dotCount = null

        chordService.save(chord)
        return this
    }

    /**
     * Selects a [Chord].
     * @param index the position of the [Chord] inside its parent [Grouping].
     * @return the same [ChordBuilder] instance that called this function.
     * @throws NoSuchElementException if there was no [Chord] found for the given [index].
     * @see appendAndSelectChord
     */
    fun selectChord(index: Int): ChordBuilder {
        val chordId =
            ChordId(
                groupingEntryId = GroupingEntryId(requireNotNull(groupingBuilder.selectedGroupingId), index),
            )
        if (!chordService.existsById(chordId)) {
            throw NoSuchElementException("Staff with ID $chordId not found")
        }
        selectedChordId = chordId
        return this
    }

    /**
     * Creates, appends and selects a [Chord].
     * @param newChord the instance from where data will be copied to the new [Chord]. Its ID is ignored.
     * @return the same [ChordBuilder] instance that called this function.
     * @see selectChord
     */
    fun appendAndSelectChord(newChord: Chord): ChordBuilder {
        var chord = chordService.appendToGrouping(requireNotNull(groupingBuilder.selectedGroupingId), newChord)
        chord = chordService.save(chord)
        selectedChordId = chord.chordId
        return this
    }

    /**
     * Deletes the selected [Chord].
     * @return the same [ChordBuilder] instance that called this function.
     * @throws UnsupportedOperationException if no [Chord] was selected.
     * @see ChordService.deleteById
     */
    fun deleteSelectedChord(): ChordBuilder {
        if (selectedChordId == null) {
            throw UnsupportedOperationException("A Chord must be selected")
        }
        chordService.deleteById(requireNotNull(selectedChordId))
        return this
    }

    /**
     * @return a new [NoteBuilder] that builds inside the selected [Chord].
     * @throws UnsupportedOperationException if no [Chord] was selected.
     */
    fun buildNotes(): NoteBuilder {
        if (selectedChordId == null) {
            throw UnsupportedOperationException("A Chord must be selected")
        }
        return NoteBuilder(this, noteService)
    }

    /**
     * @return the instance of [GroupingBuilder] that created this [ChordBuilder].
     */
    fun back(): GroupingBuilder {
        return groupingBuilder
    }
}
