package com.example.kmebackend.service.builder

import com.example.kmebackend.model.Grouping
import com.example.kmebackend.model.GroupingId
import com.example.kmebackend.service.ChordService
import com.example.kmebackend.service.GroupingService
import com.example.kmebackend.service.NoteService
import com.example.kmebackend.service.RestService

class GroupingBuilder internal constructor(
    private val voiceBuilder: VoiceBuilder,
    private val groupingService: GroupingService,
    private val restService: RestService,
    private val chordService: ChordService,
    private val noteService: NoteService,
) {
    internal var selectedGroupingId: GroupingId? = null

    private var metadata: String? = null
    private var overrideMetadata: Boolean = false

    fun setMetadata(newMetadata: String?): GroupingBuilder {
        metadata = newMetadata
        overrideMetadata = true
        return this
    }

    fun save(): GroupingBuilder {
        if (selectedGroupingId == null) {
            throw UnsupportedOperationException("A Grouping must be selected")
        }
        var grouping = groupingService.findById(requireNotNull(selectedGroupingId)).orElseThrow()
        if (overrideMetadata) {
            grouping = grouping.copy(metadata = metadata)
        }
        groupingService.save(grouping)
        return this
    }

    fun selectGrouping(index: Int): GroupingBuilder {
        val groupingId =
            GroupingId(
                voiceId = requireNotNull(voiceBuilder.selectedVoiceId),
                groupingsOrder = index,
            )
        if (!groupingService.existsById(groupingId)) {
            throw NoSuchElementException("Grouping with ID $groupingId not found")
        }
        selectedGroupingId = groupingId
        return this
    }

    fun appendAndSelectGrouping(newGrouping: Grouping): GroupingBuilder {
        var grouping = groupingService.appendToVoice(requireNotNull(voiceBuilder.selectedVoiceId), newGrouping)
        grouping = groupingService.save(grouping)
        selectedGroupingId = grouping.groupingId
        return this
    }

    fun buildRests(): RestBuilder {
        if (selectedGroupingId == null) {
            throw UnsupportedOperationException("A Grouping must be selected")
        }
        return RestBuilder(
            this,
            restService,
        )
    }

    fun buildChords(): ChordBuilder {
        if (selectedGroupingId == null) {
            throw UnsupportedOperationException("A Grouping must be selected")
        }
        return ChordBuilder(
            this,
            chordService,
            noteService,
        )
    }

    fun back(): VoiceBuilder {
        return voiceBuilder
    }
}
