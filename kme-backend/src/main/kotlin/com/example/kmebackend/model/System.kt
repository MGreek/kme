package com.example.kmebackend.model

import jakarta.persistence.*

@Entity
data class System(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    @OneToMany(mappedBy = "system")
    @OrderColumn(name = "staves_order")
    val staves: List<Staff> = emptyList(),
    val metadata: String? = null,
)
