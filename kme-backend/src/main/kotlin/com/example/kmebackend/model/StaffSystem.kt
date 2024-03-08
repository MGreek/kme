package com.example.kmebackend.model

import jakarta.persistence.*

@Embeddable
data class StaffSystemId(
    @Column(name = "staff_system_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val staffSystemId: Long? = null,
)

@Entity
data class StaffSystem(
    @EmbeddedId
    val staffSystemId: StaffSystemId,
    @OneToMany(mappedBy = "staffSystem")
    @OrderColumn(name = "staves_order")
    val staves: List<Staff> = emptyList(),
    val metadata: String? = null,
)
