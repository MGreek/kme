package com.example.kmebackend.service

import com.example.kmebackend.repository.MeasureRepository
import org.springframework.stereotype.Service

@Service
data class MeasureService(
    val measureRepository: MeasureRepository,
)
