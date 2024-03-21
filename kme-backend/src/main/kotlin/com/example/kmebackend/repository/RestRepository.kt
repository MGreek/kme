package com.example.kmebackend.repository

import com.example.kmebackend.model.Rest
import com.example.kmebackend.model.RestId
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface RestRepository : JpaRepository<Rest, RestId>
