package com.example.kmebackend.service

import com.example.kmebackend.repository.StemRepository
import org.springframework.stereotype.Service

@Service
data class StemService(
    val stemRepository: StemRepository,
)
