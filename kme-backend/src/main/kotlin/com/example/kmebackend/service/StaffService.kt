package com.example.kmebackend.service

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
}
