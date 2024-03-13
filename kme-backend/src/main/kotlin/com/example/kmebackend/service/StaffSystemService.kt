package com.example.kmebackend.service

import com.example.kmebackend.repository.StaffSystemRepository
import org.springframework.stereotype.Service

@Service
data class StaffSystemService(
    val staffSystemRepository: StaffSystemRepository,
)
