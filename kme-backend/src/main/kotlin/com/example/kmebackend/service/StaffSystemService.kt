package com.example.kmebackend.service

import com.example.kmebackend.model.Staff
import com.example.kmebackend.model.StaffSystem
import com.example.kmebackend.model.StaffSystemId
import com.example.kmebackend.repository.StaffSystemRepository
import org.springframework.stereotype.Service
import java.util.*
import kotlin.NoSuchElementException

@Service
data class StaffSystemService(
    val staffSystemRepository: StaffSystemRepository,
) {
    /**
     * A wrapper around StaffSystemRepository::save
     */
    fun save(staffSystem: StaffSystem): StaffSystem {
        return staffSystemRepository.save(staffSystem)
    }

    /**
     * A wrapper around StaffSystemRepository::findById
     */
    fun findById(staffSystemId: StaffSystemId): Optional<StaffSystem> {
        return staffSystemRepository.findById(staffSystemId)
    }

    /**
     * A wrapper around StaffSystemRepository::existsById
     */
    fun existsById(staffSystemId: StaffSystemId): Boolean {
        return staffSystemRepository.existsById(staffSystemId)
    }

    /**
     * Creates a new StaffSystem.
     * @param staffSystem the instance from where data is copied to the new StaffSystem. Its ID is ignored.
     * @return a new StaffSystem.
     */
    fun createStaffSystem(staffSystem: StaffSystem): StaffSystem {
        return staffSystem.copy(staffSystemId = StaffSystemId())
    }

    fun countChildren(staffSystemId: StaffSystemId): Int {
        if (!existsById(staffSystemId)) {
            throw NoSuchElementException("StaffSystem with ID $staffSystemId not found")
        }
        return staffSystemRepository.countChildren(staffSystemId)
    }

    fun getChildren(staffSystemId: StaffSystemId): List<Staff> {
        if (!existsById(staffSystemId)) {
            throw NoSuchElementException("StaffSystem with ID $staffSystemId not found")
        }
        return staffSystemRepository.getChildren(staffSystemId)
    }
}
