package com.example.kmebackend.service.builder

import com.example.kmebackend.model.Grouping
import com.example.kmebackend.model.GroupingId
import com.example.kmebackend.service.*

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

    /**
     * Stores newMetadata that will be used to override the selected Grouping's metadata.
     * @param newMetadata the data that will be used to override the selected Grouping's metadata.
     * @return the same GroupingBuilder instance that called this function
     * @see save
     */
    fun setMetadata(newMetadata: String?): GroupingBuilder {
        metadata = newMetadata
        overrideMetadata = true
        return this
    }

    /**
     * @return the selected Grouping's ID.
     * @throws UnsupportedOperationException if no Grouping was selected.
     */
    fun getSelectedGroupingId(): GroupingId {
        if (selectedGroupingId == null) {
            throw UnsupportedOperationException("A Grouping must be selected")
        }
        return requireNotNull(selectedGroupingId)
    }

    /**
     * Overrides the data that has been set for the selected Grouping and then saves it.
     * The data that has been set is then discarded.
     * @return the same GroupingBuilder instance that called this function
     * @throws UnsupportedOperationException if no Grouping was selected.
     */
    fun save(): GroupingBuilder {
        if (selectedGroupingId == null) {
            throw UnsupportedOperationException("A Grouping must be selected")
        }
        var grouping = groupingService.findById(requireNotNull(selectedGroupingId)).orElseThrow()
        if (overrideMetadata) {
            grouping = grouping.copy(metadata = metadata)
        }
        overrideMetadata = false

        groupingService.save(grouping)
        return this
    }

    /**
     * Selects a Grouping.
     * @param index the position of the Grouping inside its parent Voice.
     * @return the same GroupingBuilder instance that called this function
     * @throws NoSuchElementException if there was no Grouping found for the given index
     * @see appendAndSelectGrouping
     */
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

    /**
     * Creates, appends and selects a Grouping.
     * @param newGrouping the instance from where data will be copied to the new Grouping. Its ID is ignored.
     * @return the same GroupingBuilder instance that called this function.
     * @see selectGrouping
     */
    fun appendAndSelectGrouping(newGrouping: Grouping): GroupingBuilder {
        var grouping = groupingService.appendToVoice(requireNotNull(voiceBuilder.selectedVoiceId), newGrouping)
        grouping = groupingService.save(grouping)
        selectedGroupingId = grouping.groupingId
        return this
    }

    /**
     * Deletes the selected Grouping.
     * @return the same GroupingBuilder instance that called this function.
     * @throws UnsupportedOperationException if no Grouping was selected.
     * @see GroupingService.deleteById
     */
    fun deleteSelectedGrouping(): GroupingBuilder {
        if (selectedGroupingId == null) {
            throw UnsupportedOperationException("A Grouping must be selected")
        }
        groupingService.deleteById(requireNotNull(selectedGroupingId))
        return this
    }

    /**
     * @return a new RestBuilder that builds inside the selected Grouping.
     * @throws UnsupportedOperationException if no Grouping was selected.
     */
    fun buildRests(): RestBuilder {
        if (selectedGroupingId == null) {
            throw UnsupportedOperationException("A Grouping must be selected")
        }
        return RestBuilder(
            this,
            restService,
        )
    }

    /**
     * @return a new ChordBuilder that builds inside the selected Grouping.
     * @throws UnsupportedOperationException if no Grouping was selected.
     */
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

    /**
     * @return the instance of VoiceBuilder that created this GroupingBuilder.
     */
    fun back(): VoiceBuilder {
        return voiceBuilder
    }
}
