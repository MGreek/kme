package com.example.kmebackend.model

import jakarta.persistence.*

@Embeddable
data class StemMetadata(
    val stemPlaceholder: String = "",
)

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
data class Stem(
    @Enumerated(EnumType.STRING)
    val stemType: StemType,
    @Embedded
    val metadata: StemMetadata = StemMetadata(),
)