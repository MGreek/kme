package com.example.kmebackend.service

import com.example.kmebackend.model.*
import com.example.kmebackend.model.dto.MeasureDTO
import com.example.kmebackend.model.dto.VoiceDTO
import com.example.kmebackend.repository.MeasureRepository
import com.example.kmebackend.repository.StaffRepository
import org.springframework.stereotype.Service
import java.util.*
import kotlin.NoSuchElementException

@Service
data class MeasureService(
    val voiceService: VoiceService,
    val measureRepository: MeasureRepository,
    val staffRepository: StaffRepository,
) {
    /**
     * A wrapper around MeasureRepository::save
     */
    fun save(measure: Measure): Measure {
        return measureRepository.save(measure)
    }

    /**
     * A wrapper around MeasureRepository::findById
     */
    fun findById(measureId: MeasureId): Optional<Measure> {
        return measureRepository.findById(measureId)
    }

    /**
     * A wrapper around MeasureRepository::existsById
     */
    fun existsById(measureId: MeasureId): Boolean {
        return measureRepository.existsById(measureId)
    }

    /**
     * Creates a new Measure and appends it to the list corresponding to staffId.
     * @param staffId must correspond to a saved Staff.
     * @param measure the instance from where data is copied to the new Measure. Its ID is ignored.
     * @return a new Measure that is appended to the list corresponding to staffId.
     * @throws NoSuchElementException if staffId doesn't correspond to a Staff.
     */
    fun appendToStaff(
        staffId: StaffId,
        measure: Measure,
    ): Measure {
        if (!staffRepository.existsById(staffId)) {
            throw NoSuchElementException("Staff with ID $staffId not found")
        }
        val newMeasure =
            measure.copy(
                measureId =
                    MeasureId(
                        staffId,
                        staffRepository.countChildren(staffId),
                    ),
                staff = staffRepository.findById(staffId).get(),
            )
        return newMeasure
    }

    /**
     * @param measureId the id of the Measure.
     * @return the number of children of the Measure corresponding to measureId.
     * @throws NoSuchElementException if measureId doesn't correspond to a Measure.
     */
    fun countChildren(measureId: MeasureId): Int {
        if (!existsById(measureId)) {
            throw NoSuchElementException("Measure with ID $measureId not found")
        }
        return measureRepository.countChildren(measureId)
    }

    /**
     * @param measureId the id of the Measure.
     * @return the number of children of the Measure corresponding to measureId.
     * @throws NoSuchElementException if measureId doesn't correspond to a Measure.
     */
    fun getChildren(measureId: MeasureId): List<Voice> {
        if (!existsById(measureId)) {
            throw NoSuchElementException("Measure with ID $measureId not found")
        }
        return measureRepository.getChildren(measureId)
    }

    /**
     * Deletes all Measure entities and their children.
     */
    fun deleteAll() {
        voiceService.deleteAll()
        measureRepository.deleteAll()
    }

    /**
     * Deletes the Measure corresponding to measureId and its children.
     * @param measureId the ID of the Measure to be deleted.
     * @throws NoSuchElementException if measureId doesn't correspond to a Measure.
     */
    fun deleteById(measureId: MeasureId) {
        if (!existsById(measureId)) {
            throw NoSuchElementException("Measure with ID $measureId not found")
        }
        val children = getChildren(measureId)
        for (child in children) {
            voiceService.deleteById(requireNotNull(child.voiceId))
        }
        measureRepository.deleteById(measureId)
    }

    /**
     * Turns a [Measure] into a [MeasureDTO].
     * @param measure the instance that is used to create the [MeasureDTO].
     * @return a [MeasureDTO] that is derived from the given [Measure].
     * @throws UnsupportedOperationException if [measure's][measure] ID is null.
     * @throws NoSuchElementException if [measure] is not found.
     */
    fun measureToDTO(measure: Measure): MeasureDTO {
        if (measure.measureId == null) {
            throw UnsupportedOperationException("Measures ID must not be null")
        }
        if (!existsById(requireNotNull(measure.measureId))) {
            throw NoSuchElementException("Measure with ID ${requireNotNull(measure.measureId)} not found")
        }
        val voiceDTOs = mutableListOf<VoiceDTO>()
        for (child in getChildren(requireNotNull(measure.measureId))) {
            voiceDTOs.add(voiceService.voiceToDTO(child))
        }

        return MeasureDTO(
            measuresOrder = requireNotNull(measure.measureId).measuresOrder,
            metadata = measure.metadata,
            keySignature = measure.keySignature,
            timeSignature = measure.timeSignature,
            clef = measure.clef,
            voiceDTOs = voiceDTOs,
        )
    }
}
