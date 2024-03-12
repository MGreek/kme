package com.example.kmebackend.service

import com.example.kmebackend.repository.GroupingRepository
import org.springframework.stereotype.Service

@Service
data class GroupingService(
    val groupingRepository: GroupingRepository,
)
