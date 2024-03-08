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

@Embeddable
data class StemId(
    @Embedded
    val chordId: ChordId,
)

@Entity
data class Stem(
    @EmbeddedId
    val stemId: StemId,
    @MapsId("chordId") @OneToOne(optional = false)
    val chord: Chord,
    @Enumerated(EnumType.STRING)
    val stemType: StemType,
    val metadata: String? = null,
)
