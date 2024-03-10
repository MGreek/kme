package com.example.kmebackend.repository

import com.example.kmebackend.model.Grouping
import com.example.kmebackend.model.GroupingId
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface GroupingRepository : JpaRepository<Grouping, GroupingId>
