package com.example.kmebackend.repository

import com.example.kmebackend.model.StaffSystem
import com.example.kmebackend.model.StaffSystemId
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface StaffSystemRepository : JpaRepository<StaffSystem, StaffSystemId>