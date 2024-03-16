package com.example.kmebackend.service

import com.example.kmebackend.model.MeasureId
import com.example.kmebackend.model.Voice
import com.example.kmebackend.model.VoiceId
import com.example.kmebackend.repository.MeasureRepository
import com.example.kmebackend.repository.VoiceRepository
import org.springframework.stereotype.Service
import java.util.*
import kotlin.NoSuchElementException

@Service
data class VoiceService(
    val voiceRepository: VoiceRepository,
    val measureRepository: MeasureRepository,
) {
    /**
     * A wrapper around VoiceRepository::save
     */
    fun save(voice: Voice): Voice {
        return voiceRepository.save(voice)
    }

    /**
     * A wrapper around VoiceRepository::findById
     */
    fun findById(voiceId: VoiceId): Optional<Voice> {
        return voiceRepository.findById(voiceId)
    }

    /**
     * A wrapper around VoiceRepository::existsById
     */
    fun existsById(voiceId: VoiceId): Boolean {
        return voiceRepository.existsById(voiceId)
    }

    /**
     * Creates a new Voice and appends it to the list corresponding to measureId.
     * @param measureId must correspond to a saved Measure.
     * @param voice the instance from where data is copied to the new Voice. Its ID is ignored.
     * @return a new Voice that is appended to the list corresponding to measureId.
     */
    fun appendToMeasure(
        measureId: MeasureId,
        voice: Voice,
    ): Voice {
        if (!measureRepository.existsById(measureId)) {
            throw NoSuchElementException("Measure with ID $measureId not found")
        }
        val newVoice =
            voice.copy(
                voiceId =
                    VoiceId(
                        measureId,
                        measureRepository.countChildren(measureId),
                    ),
                measure = measureRepository.findById(measureId).get(),
            )
        return newVoice
    }
}
