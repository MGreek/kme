package com.example.kmebackend.service

import com.example.kmebackend.model.Staff
import com.example.kmebackend.model.StaffSystem
import com.example.kmebackend.model.StaffSystemId
import com.example.kmebackend.model.dto.StaffDTO
import com.example.kmebackend.model.dto.StaffSystemDTO
import com.example.kmebackend.repository.StaffSystemRepository
import org.springframework.stereotype.Service
import java.util.*
import kotlin.NoSuchElementException

@Service
data class StaffSystemService(
    val staffService: StaffService,
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

    /**
     * @param staffSystemId the id of the StaffSystem.
     * @return the number of children of the StaffSystem corresponding to staffSystemId.
     * @throws NoSuchElementException if staffSystemId doesn't correspond to a StaffSystem.
     */
    fun countChildren(staffSystemId: StaffSystemId): Int {
        if (!existsById(staffSystemId)) {
            throw NoSuchElementException("StaffSystem with ID $staffSystemId not found")
        }
        return staffSystemRepository.countChildren(staffSystemId)
    }

    /**
     * @param staffSystemId the id of the StaffSystem.
     * @return the children of the StaffSystem corresponding to staffSystemId.
     * @throws NoSuchElementException if staffSystemId doesn't correspond to a StaffSystem.
     */
    fun getChildren(staffSystemId: StaffSystemId): List<Staff> {
        if (!existsById(staffSystemId)) {
            throw NoSuchElementException("StaffSystem with ID $staffSystemId not found")
        }
        return staffSystemRepository.getChildren(staffSystemId)
    }

    /**
     * Deletes all StaffSystem entities and their children.
     */
    fun deleteAll() {
        staffService.deleteAll()
        staffSystemRepository.deleteAll()
    }

    /**
     * Deletes the StaffSystem corresponding to staffSystemId and its children.
     * @param staffSystemId the ID of the StaffSystem to be deleted.
     * @throws NoSuchElementException if staffSystemId doesn't correspond to a StaffSystem.
     */
    fun deleteById(staffSystemId: StaffSystemId) {
        if (!existsById(staffSystemId)) {
            throw NoSuchElementException("StaffSystem with ID $staffSystemId not found")
        }
        val children = getChildren(staffSystemId)
        for (child in children) {
            staffService.deleteById(requireNotNull(child.staffId))
        }
        staffSystemRepository.deleteById(staffSystemId)
    }

    /**
     * Turns a [StaffSystem] into a [StaffSystemDTO].
     * @param staffSystem the instance that is used to create the [StaffSystemDTO].
     * @return a [StaffSystemDTO] that is derived from the given [StaffSystem].
     * @throws UnsupportedOperationException if [staffSystem's][staffSystem] ID is null.
     * @throws NoSuchElementException if [staffSystem] is not found.
     */
    fun staffSystemToDTO(staffSystem: StaffSystem): StaffSystemDTO {
        if (staffSystem.staffSystemId == null) {
            throw UnsupportedOperationException("StaffSystems ID must not be null")
        }
        if (!existsById(requireNotNull(staffSystem.staffSystemId))) {
            throw NoSuchElementException("StaffSystem with ID ${requireNotNull(staffSystem.staffSystemId)} not found")
        }

        val staffDTOs = mutableListOf<StaffDTO>()
        for (staff in getChildren(requireNotNull(staffSystem.staffSystemId))) {
            staffDTOs.add(staffService.staffToDTO(staff))
        }

        return StaffSystemDTO(
            id = requireNotNull(staffSystem.staffSystemId).staffSystemId,
            metadata = staffSystem.metadata,
            staffDTOs = staffDTOs,
        )
    }
}
