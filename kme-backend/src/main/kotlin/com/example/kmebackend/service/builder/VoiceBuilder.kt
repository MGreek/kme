package com.example.kmebackend.service.builder

import com.example.kmebackend.model.Voice
import com.example.kmebackend.model.VoiceId
import com.example.kmebackend.service.*

class VoiceBuilder internal constructor(
    private val measureBuilder: MeasureBuilder,
    private val voiceService: VoiceService,
    private val groupingService: GroupingService,
    private val restService: RestService,
    private val chordService: ChordService,
    private val noteService: NoteService,
) {
    internal var selectedVoiceId: VoiceId? = null

    private var metadata: String? = null
    private var overrideMetadata: Boolean = false

    fun setMetadata(newMetadata: String?): VoiceBuilder {
        metadata = newMetadata
        overrideMetadata = true
        return this
    }

    fun save(): VoiceBuilder {
        if (selectedVoiceId == null) {
            throw UnsupportedOperationException("A Voice must be selected")
        }
        var voice = voiceService.findById(requireNotNull(selectedVoiceId)).orElseThrow()
        if (overrideMetadata) {
            voice = voice.copy(metadata = metadata)
        }
        overrideMetadata = false

        voiceService.save(voice)
        return this
    }

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

    fun appendAndSelectVoice(newVoice: Voice): VoiceBuilder {
        var voice = voiceService.appendToMeasure(requireNotNull(measureBuilder.selectedMeasureId), newVoice)
        voice = voiceService.save(voice)
        selectedVoiceId = voice.voiceId
        return this
    }

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

    fun back(): MeasureBuilder {
        return measureBuilder
    }
}
