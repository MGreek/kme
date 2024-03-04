package com.example.kmebackend.model

import jakarta.persistence.*

enum class StemType {
    Whole,
    Half,
    Quarter,
    Eight,
    Sixteenth,
    Thirtysecond,
    Sixtyfourth,
}

@Entity
data class Stem(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    @OneToOne(optional = false)
    val chord: Chord? = null,
    @Enumerated(EnumType.STRING)
    val stemType: StemType,
    val metadata: String? = null,
)
