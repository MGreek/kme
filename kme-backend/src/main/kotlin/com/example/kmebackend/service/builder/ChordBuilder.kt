package com.example.kmebackend.service.builder

import com.example.kmebackend.model.*
import com.example.kmebackend.service.ChordService
import com.example.kmebackend.service.NoteService

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

    fun setMetadata(newMetadata: String?): ChordBuilder {
        metadata = newMetadata
        overrideMetadata = true
        return this
    }

    fun setStemType(newStemType: StemType): ChordBuilder {
        stemType = newStemType
        return this
    }

    fun setStemMetadata(newStemMetadata: String?): ChordBuilder {
        stemMetadata = newStemMetadata
        overrideStemMetadata = true
        return this
    }

    fun setDotCount(newDotCount: Long): ChordBuilder {
        dotCount = newDotCount
        return this
    }

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

    fun appendAndSelectChord(newChord: Chord): ChordBuilder {
        var chord = chordService.appendToGrouping(requireNotNull(groupingBuilder.selectedGroupingId), newChord)
        chord = chordService.save(chord)
        selectedChordId = chord.chordId
        return this
    }

    fun buildNotes(): NoteBuilder {
        if (selectedChordId == null) {
            throw UnsupportedOperationException("A Chord must be selected")
        }
        return NoteBuilder(this, noteService)
    }

    fun back(): GroupingBuilder {
        return groupingBuilder
    }
}
