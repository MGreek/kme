package com.example.kmebackend.model

import jakarta.persistence.*
import java.util.UUID

@Embeddable
data class StaffSystemId(
    @Column(name = "staff_system_id")
    val staffSystemId: String = UUID.randomUUID().toString(),
)

@Entity
data class StaffSystem(
    @EmbeddedId
    val staffSystemId: StaffSystemId? = null,
    val metadata: String? = null,
)
