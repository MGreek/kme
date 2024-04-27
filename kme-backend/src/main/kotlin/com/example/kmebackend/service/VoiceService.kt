package com.example.kmebackend.service

import com.example.kmebackend.model.*
import com.example.kmebackend.model.dto.GroupingDTO
import com.example.kmebackend.model.dto.VoiceDTO
import com.example.kmebackend.repository.MeasureRepository
import com.example.kmebackend.repository.VoiceRepository
import org.springframework.stereotype.Service
import java.util.*
import kotlin.NoSuchElementException

@Service
data class VoiceService(
    val groupingService: GroupingService,
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
     * @throws NoSuchElementException if measureId doesn't correspond to a Measure.
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

    /**
     * @param voiceId the id of the Voice.
     * @return the number of children of the Voice corresponding to voiceId.
     * @throws NoSuchElementException if voiceId doesn't correspond to a Voice.
     */
    fun countChildren(voiceId: VoiceId): Int {
        if (!existsById(voiceId)) {
            throw NoSuchElementException("Voice with ID $voiceId not found")
        }
        return voiceRepository.countChildren(voiceId)
    }

    /**
     * @param voiceId the id of the Voice.
     * @return the children of the Voice corresponding to voiceId.
     * @throws NoSuchElementException if voiceId doesn't correspond to a Voice.
     */
    fun getChildren(voiceId: VoiceId): List<Grouping> {
        if (!existsById(voiceId)) {
            throw NoSuchElementException("Voice with ID $voiceId not found")
        }
        return voiceRepository.getChildren(voiceId)
    }

    /**
     * Deletes all Voice entities and their children.
     */
    fun deleteAll() {
        groupingService.deleteAll()
        voiceRepository.deleteAll()
    }

    /**
     * Deletes the Voice corresponding to voiceId and its children.
     * @param voiceId the ID of the Voice to be deleted.
     * @throws NoSuchElementException if voiceId doesn't correspond to a Voice.
     */
    fun deleteById(voiceId: VoiceId) {
        if (!existsById(voiceId)) {
            throw NoSuchElementException("Voice with ID $voiceId not found")
        }
        val children = getChildren(voiceId)
        for (child in children) {
            groupingService.deleteById(requireNotNull(child.groupingId))
        }
        voiceRepository.deleteById(voiceId)
    }

    /**
     * Turns a [Voice] into a [VoiceDTO].
     * @param voice the instance that is used to create the [VoiceDTO].
     * @return a [VoiceDTO] that is derived from the given [Voice].
     * @throws UnsupportedOperationException if [voice's][voice] ID is null.
     * @throws NoSuchElementException if [voice] is not found.
     */
    fun voiceToDTO(voice: Voice): VoiceDTO {
        if (voice.voiceId == null) {
            throw UnsupportedOperationException("Voices ID must not be null")
        }
        if (!existsById(requireNotNull(voice.voiceId))) {
            throw NoSuchElementException("Voice with ID ${requireNotNull(voice.voiceId)} not found")
        }
        val groupingDTOs = mutableListOf<GroupingDTO>()
        for (child in getChildren(requireNotNull(voice.voiceId))) {
            groupingDTOs.add(groupingService.groupingToDTO(child))
        }

        return VoiceDTO(
            metadata = voice.metadata,
            groupingDTOs = groupingDTOs,
        )
    }
}