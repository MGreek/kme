package com.example.kmebackend.service.builder

import com.example.kmebackend.model.*
import com.example.kmebackend.service.ChordService
import com.example.kmebackend.service.NoteService

/**
 * A class that makes building [Chords][Chord] easier and faster.
 */
class ChordBuilder internal constructor(
    private val groupingBuilder: GroupingBuilder,
    private val chordService: ChordService,
    private val noteService: NoteService,
) {
    internal var selectedChordId: ChordId? = null

    private var metadataJson: String? = null
    private var stemType: StemType? = null
    private var stemMetadataJson: String? = null
    private var dotCount: Long? = null

    /**
     * Stores [newMetadataJson] that will be used to override the selected [Chord's][Chord] [Chord.metadataJson].
     * @param newMetadataJson the data that will be used to override the selected [Chord's][Chord] [Chord.metadataJson].
     * @return the same [ChordBuilder] instance that called this function.
     * @see save
     */
    fun setMetadata(newMetadataJson: String?): ChordBuilder {
        metadataJson = newMetadataJson
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
     * Stores [stemMetadataJson] that will be used to override the selected [Chord's][Chord] [stemMetadata][Stem.metadataJson].
     * @param stemMetadataJson the data that will be used to override the selected [Chord's][Chord] [stemMetadata][Stem.metadataJson].
     * @return the same [ChordBuilder] instance that called this function.
     * @see save
     */
    fun setStemMetadata(stemMetadataJson: String?): ChordBuilder {
        this.stemMetadataJson = stemMetadataJson
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
        if (metadataJson != null) {
            chord = chord.copy(metadataJson = requireNotNull(metadataJson))
        }
        metadataJson = null
        if (stemType != null) {
            chord = chord.copy(stem = chord.stem.copy(stemType = requireNotNull(stemType)))
        }
        stemType = null
        if (stemMetadataJson != null) {
            chord = chord.copy(stem = chord.stem.copy(metadataJson = requireNotNull(stemMetadataJson)))
        }
        stemMetadataJson = null
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