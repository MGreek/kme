package com.example.kmebackend.model

import jakarta.persistence.*

@Entity
data class Voice(
    @Id
    @ManyToOne
    val measure: Measure? = null,
    @Id
    @Column(name = "voices_order")
    val voicesOrder: Long? = null,
    @OneToMany(mappedBy = "voice")
    @OrderColumn(name = "groupings_order")
    val groupings: List<Grouping> = emptyList(),
    val metadata: String? = null,
)
