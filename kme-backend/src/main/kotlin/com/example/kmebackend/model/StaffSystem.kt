package com.example.kmebackend.model

import jakarta.persistence.*

@Embeddable
data class StaffSystemId(
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val staffSystemId: Long,
)

@Entity
data class StaffSystem(
    @EmbeddedId
    val staffSystemId: StaffSystemId? = null,
    @OneToMany(mappedBy = "staffSystem")
    @OrderColumn(name = "staves_order")
    val staves: List<Staff> = emptyList(),
    val metadata: String? = null,
)
