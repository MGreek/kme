package com.example.kmebackend.repository

import com.example.kmebackend.model.GroupingEntry
import com.example.kmebackend.model.GroupingEntryId
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface GroupingEntryRepository : JpaRepository<GroupingEntry, GroupingEntryId>
