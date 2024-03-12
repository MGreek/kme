package com.example.kmebackend.service

import com.example.kmebackend.repository.StaffRepository
import org.springframework.stereotype.Service

@Service
data class StaffService(
    val staffRepository: StaffRepository,
)
