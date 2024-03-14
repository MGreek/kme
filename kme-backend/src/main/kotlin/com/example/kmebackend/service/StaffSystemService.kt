package com.example.kmebackend.service

import com.example.kmebackend.model.StaffSystem
import com.example.kmebackend.repository.StaffSystemRepository
import org.springframework.stereotype.Service

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
}
