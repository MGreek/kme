package com.example.kmebackend.service

import com.example.kmebackend.repository.GroupingEntryRepository
import org.springframework.stereotype.Service

@Service
data class GroupingEntryService(
    val groupingEntryRepository: GroupingEntryRepository,
)
