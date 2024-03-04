package com.example.kmebackend.model

import jakarta.persistence.*

enum class RestType {
    Whole,
    Half,
    Quarter,
    Eight,
    Sixteenth,
    Thirtysecond,
    Sixtyfourth,
}

@Entity
data class Rest(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    @OneToOne(optional = false, mappedBy = "rest")
    val groupingEntry: GroupingEntry? = null,
    @Enumerated(EnumType.STRING)
    val restType: RestType,
    val metadata: String? = null,
)
