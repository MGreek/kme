package com.example.kmebackend.model

import jakarta.persistence.*

enum class KeySignature {
    Flat7,
    Flat6,
    Flat5,
    Flat4,
    Flat3,
    Flat2,
    Flat1,
    None,
    Sharp1,
    Sharp2,
    Sharp3,
    Sharp4,
    Sharp5,
    Sharp6,
    Sharp7,
}

enum class TimeSignature {
    Common,
    FourFour,
    ThreeFour,
    TwoFour,
}

enum class Clef {
    Treble,
    Alto,
    Bass,
}

@Entity
data class Measure(
    @Id
    @ManyToOne
    val staff: Staff? = null,
    @Id
    @Column(name = "measures_order")
    val measuresOrder: Long? = null,
    @OneToMany(mappedBy = "measure")
    @OrderColumn(name = "voices_order")
    val voices: List<Voice> = emptyList(),
    @Enumerated(EnumType.STRING)
    val keySignature: KeySignature,
    @Enumerated(EnumType.STRING)
    val timeSignature: TimeSignature,
    @Enumerated(EnumType.STRING)
    val clef: Clef,
    val metadata: String? = null,
)
