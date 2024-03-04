package com.example.kmebackend.model

import jakarta.persistence.*
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min

enum class Accidental {
    DoubleFlat,
    Flat,
    None,
    Natural,
    Sharp,
    DoubleSharp,
}

@Entity
data class Note(
    @Id
    @ManyToOne
    val chord: Chord? = null,
    @Id
    val position: Long,
    @Enumerated(EnumType.STRING)
    val accidental: Accidental,
    @Min(0) @Max(4)
    val dotCount: Long,
    val metadata: String? = null,
)
