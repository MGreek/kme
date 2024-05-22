package com.example.kmebackend.service.builder

import com.example.kmebackend.model.Measure
import com.example.kmebackend.model.Voice
import com.example.kmebackend.model.VoiceId
import com.example.kmebackend.service.*

/**
 * A class that makes building [Voices][Voice] easier and faster.
 */
class VoiceBuilder internal constructor(
    private val measureBuilder: MeasureBuilder,
    private val voiceService: VoiceService,
    private val groupingService: GroupingService,
    private val restService: RestService,
    private val chordService: ChordService,
    private val noteService: NoteService,
) {
    internal var selectedVoiceId: VoiceId? = null

    private var metadataJson: String? = null

    /**
     * Stores [newMetadataJson] that will be used to override the selected [Voice's][Voice] [Voice.metadataJson].
     * @param newMetadataJson the data that will be used to override the selected [Voice's][Voice] [Voice.metadataJson].
     * @return the same [VoiceBuilder] instance that called this function.
     * @see save
     */
    fun setMetadata(newMetadataJson: String?): VoiceBuilder {
        metadataJson = newMetadataJson
        return this
    }

    /**
     * @return the selected [Voice's][Voice] ID.
     * @throws UnsupportedOperationException if no [Voice] was selected.
     */
    fun getSelectedVoiceId(): VoiceId {
        if (selectedVoiceId == null) {
            throw UnsupportedOperationException("A Voice must be selected")
        }
        return requireNotNull(selectedVoiceId)
    }

    /**
     * Overrides the data that has been set for the selected [Voice] and then saves it.
     * The data that has been set is then discarded.
     * @return the same [VoiceBuilder] instance that called this function.
     * @throws UnsupportedOperationException if no [Voice] was selected.
     */
    fun save(): VoiceBuilder {
        if (selectedVoiceId == null) {
            throw UnsupportedOperationException("A Voice must be selected")
        }
        var voice = voiceService.findById(requireNotNull(selectedVoiceId)).orElseThrow()
        if (metadataJson != null) {
            voice = voice.copy(metadataJson = requireNotNull(metadataJson))
        }
        metadataJson = null

        voiceService.save(voice)
        return this
    }

    /**
     * Selects a [Voice].
     * @param index the position of the [Voice] inside its parent [Measure].
     * @return the same [VoiceBuilder] instance that called this function.
     * @throws NoSuchElementException if there was no [Voice] found for the given [index].
     * @see appendAndSelectVoice
     */
    fun selectVoice(index: Int): VoiceBuilder {
        val voiceId =
            VoiceId(
                measureId = requireNotNull(measureBuilder.selectedMeasureId),
                voicesOrder = index,
            )
        if (!voiceService.existsById(voiceId)) {
            throw NoSuchElementException("Voice with ID $voiceId not found")
        }
        selectedVoiceId = voiceId
        return this
    }

    /**
     * Creates, appends and selects a [Voice].
     * @param newVoice the instance from where data will be copied to the new [Voice]. Its ID is ignored.
     * @return the same [VoiceBuilder] instance that called this function.
     * @see selectVoice
     */
    fun appendAndSelectVoice(newVoice: Voice): VoiceBuilder {
        var voice = voiceService.appendToMeasure(requireNotNull(measureBuilder.selectedMeasureId), newVoice)
        voice = voiceService.save(voice)
        selectedVoiceId = voice.voiceId
        return this
    }

    /**
     * Deletes the selected [Voice].
     * @return the same [VoiceBuilder] instance that called this function.
     * @throws UnsupportedOperationException if no [Voice] was selected.
     * @see VoiceService.deleteById
     */
    fun deleteSelectedVoice(): VoiceBuilder {
        if (selectedVoiceId == null) {
            throw UnsupportedOperationException("A Voice must be selected")
        }
        voiceService.deleteById(requireNotNull(selectedVoiceId))
        return this
    }

    /**
     * @return a new [GroupingBuilder] that builds inside the selected [Voice].
     * @throws UnsupportedOperationException if no [Voice] was selected.
     */
    fun buildGroupings(): GroupingBuilder {
        if (selectedVoiceId == null) {
            throw UnsupportedOperationException("A Voice must be selected")
        }
        return GroupingBuilder(
            this,
            groupingService,
            restService,
            chordService,
            noteService,
        )
    }

    /**
     * @return the instance of [MeasureBuilder] that created this [VoiceBuilder].
     */
    fun back(): MeasureBuilder {
        return measureBuilder
    }
}