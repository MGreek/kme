package com.example.kmebackend.service

import com.example.kmebackend.model.Measure
import com.example.kmebackend.model.Staff
import com.example.kmebackend.model.StaffId
import com.example.kmebackend.model.StaffSystemId
import com.example.kmebackend.repository.StaffRepository
import com.example.kmebackend.repository.StaffSystemRepository
import org.springframework.stereotype.Service
import java.util.*
import kotlin.NoSuchElementException

@Service
data class StaffService(
    val measureService: MeasureService,
    val staffRepository: StaffRepository,
    val staffSystemRepository: StaffSystemRepository,
) {
    /**
     * A wrapper around StaffRepository::save
     */
    fun save(staff: Staff): Staff {
        return staffRepository.save(staff)
    }

    /**
     * A wrapper around StaffRepository::findById
     */
    fun findById(staffId: StaffId): Optional<Staff> {
        return staffRepository.findById(staffId)
    }

    /**
     * A wrapper around StaffRepository::existsById
     */
    fun existsById(staffId: StaffId): Boolean {
        return staffRepository.existsById(staffId)
    }

    /**
     * Creates a new Staff and appends it to the list corresponding to staffSystemId.
     * @param staffSystemId must correspond to a saved StaffSystem.
     * @param staff the instance from where data is copied to the new Staff. Its ID is ignored.
     * @return a new Staff that is appended to the list corresponding to staffSystemId.
     */
    fun appendToStaffSystem(
        staffSystemId: StaffSystemId,
        staff: Staff,
    ): Staff {
        if (!staffSystemRepository.existsById(staffSystemId)) {
            throw NoSuchElementException("StaffSystem with ID $staffSystemId not found")
        }
        val newStaff =
            staff.copy(
                staffId =
                    StaffId(
                        staffSystemId,
                        staffSystemRepository.countChildren(staffSystemId),
                    ),
                staffSystem = staffSystemRepository.findById(staffSystemId).get(),
            )
        return newStaff
    }

    /**
     * @param staffId the id of the Staff.
     * @return the number of children of the Staff corresponding to staffId.
     */
    fun countChildren(staffId: StaffId): Int {
        if (!existsById(staffId)) {
            throw NoSuchElementException("Staff with ID $staffId not found")
        }
        return staffRepository.countChildren(staffId)
    }

    /**
     * @param staffId the id of the Staff.
     * @return the children of the Staff corresponding to staffId.
     */
    fun getChildren(staffId: StaffId): List<Measure> {
        if (!existsById(staffId)) {
            throw NoSuchElementException("Staff with ID $staffId not found")
        }
        return staffRepository.getChildren(staffId)
    }

    /**
     * Deletes all Staff entities and their children.
     */
    fun deleteAll() {
        measureService.deleteAll()
        staffRepository.deleteAll()
    }

    /**
     * Deletes the Staff corresponding to staffId and its children.
     * @param staffId the ID of the Staff to be deleted.
     * @throws NoSuchElementException if staffId doesn't correspond to a Staff.
     */
    fun deleteById(staffId: StaffId) {
        if (!existsById(staffId)) {
            throw NoSuchElementException("Staff with ID $staffId not found")
        }
        val children = getChildren(staffId)
        for (child in children) {
            measureService.deleteById(requireNotNull(child.measureId))
        }
        staffRepository.deleteById(staffId)
    }
}
