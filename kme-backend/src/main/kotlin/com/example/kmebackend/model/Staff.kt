package com.example.kmebackend.model

import jakarta.persistence.*

@Entity
data class Staff(
    @Id
    @ManyToOne
    val system: System? = null,
    @Id
    @Column(name = "staves_order")
    val stavesOrder: Long? = null,
    @OneToMany(mappedBy = "staff")
    @OrderColumn(name = "measures_order")
    val measures: List<Measure> = emptyList(),
    val metadata: String? = null,
)
