package com.example.kmebackend.service

import com.example.kmebackend.model.Measure
import com.example.kmebackend.model.MeasureId
import com.example.kmebackend.model.StaffId
import com.example.kmebackend.repository.MeasureRepository
import com.example.kmebackend.repository.StaffRepository
import org.springframework.stereotype.Service

@Service
data class MeasureService(
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
     * Creates a new Measure and appends it to the list corresponding to staffId.
     * @param staffId must correspond to a saved Staff.
     * @param measure the instance from where data is copied to the new Measure. Its ID is ignored.
     * @return a new Measure that is appended to the list corresponding to staffId.
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
}
